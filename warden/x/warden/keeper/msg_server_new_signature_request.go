package keeper

import (
	"context"
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/gogoproto/proto"

	"github.com/warden-protocol/wardenprotocol/shield/ast"
	intenttypes "github.com/warden-protocol/wardenprotocol/warden/x/intent/types"
	types "github.com/warden-protocol/wardenprotocol/warden/x/warden/types/v1beta2"
)

func (k msgServer) NewSignatureRequest(goCtx context.Context, msg *types.MsgNewSignatureRequest) (*intenttypes.MsgActionCreated, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	key, err := k.KeysKeeper.Get(ctx, msg.KeyId)
	if err != nil {
		return nil, err
	}

	space, err := k.SpacesKeeper.Get(ctx, key.SpaceId)
	if err != nil {
		return nil, err
	}

	keychain, err := k.keychains.Get(ctx, key.KeychainId)
	if err != nil {
		return nil, err
	}

	if !keychain.IsActive {
		return nil, fmt.Errorf("keychain is nil or is inactive")
	}

	intent, err := k.newSignatureRequestIntent(ctx, space, key)
	if err != nil {
		return nil, err
	}

	ctxWithVals, dataForSigning, err := k.executeAnalyzers(ctx, msg.Creator, msg.Analyzers, msg.Input)
	if err != nil {
		return nil, fmt.Errorf("executing analyzers: %w", err)
	}

	if dataForSigning != nil {
		msg.Input = dataForSigning
	}

	act, err := k.intentKeeper.AddAction(ctxWithVals, msg.Creator, msg, intent, msg.Btl)
	if err != nil {
		return nil, err
	}

	return &intenttypes.MsgActionCreated{Action: act}, nil
}

func (k msgServer) executeAnalyzers(ctx sdk.Context, creator string, contracts []string, input []byte) (context.Context, []byte, error) {
	creatorAddr := sdk.MustAccAddressFromBech32(creator)
	analyzerVals := make(map[string]map[string]*ast.Expression)
	var dataForSigning []byte
	for _, contract := range contracts {
		contractAddr := sdk.MustAccAddressFromBech32(contract)
		dfs, vals, err := k.ExecuteAnalyzer(ctx, contractAddr, creatorAddr, input)
		if err != nil {
			return nil, nil, err
		}
		if dfs != nil && dataForSigning != nil {
			return nil, nil, fmt.Errorf("two or more contracts tried to set DataForSigning. Only one analyzer contract can return DataForSigning")
		}
		if dfs != nil {
			dataForSigning = dfs
		}
		analyzerVals[contract] = vals
	}
	return WithAnalyzerValues(ctx, analyzerVals), dataForSigning, nil
}

func (k msgServer) newSignatureRequestIntent(ctx sdk.Context, space types.Space, key types.Key) (intenttypes.Intent, error) {
	if key.IntentId > 0 {
		return k.intentKeeper.GetIntent(ctx, key.IntentId)
	} else if space.SignIntentId > 0 {
		return k.intentKeeper.GetIntent(ctx, space.SignIntentId)
	} else {
		return space.IntentNewSignatureRequest(), nil
	}
}

func (k msgServer) NewSignatureRequestActionHandler(ctx context.Context, act intenttypes.Action) (proto.Message, error) {
	msg, err := intenttypes.GetActionMessage[*types.MsgNewSignatureRequest](k.cdc, act)
	if err != nil {
		return nil, err
	}

	key, err := k.KeysKeeper.Get(ctx, msg.KeyId)
	if err != nil {
		return nil, err
	}

	_, err = k.SpacesKeeper.Get(ctx, key.SpaceId)
	if err != nil {
		return nil, err
	}

	keychain, err := k.keychains.Get(ctx, key.KeychainId)
	if err != nil {
		return nil, err
	}

	if keychain.Fees != nil {
		err := k.bankKeeper.SendCoins(
			ctx,
			sdk.MustAccAddressFromBech32(msg.Creator),
			keychain.AccAddress(),
			sdk.NewCoins(sdk.NewInt64Coin("uward", keychain.Fees.SigReq)),
		)
		if err != nil {
			return nil, err
		}
	}

	// parse tx based on SignMethod
	handler, err := types.NewSignMethodHandler(&key, msg.SignMethod)
	if err != nil {
		return nil, err
	}

	var meta types.Metadata
	if err := k.cdc.UnpackAny(msg.Metadata, &meta); err != nil {
		return nil, fmt.Errorf("failed to unpack metadata: %w", err)
	}
	transfer, err := handler.Handle(msg.Input, meta)
	if err != nil {
		return nil, fmt.Errorf("failed to parse tx: %w", err)
	}

	req := &types.SignRequest{
		Creator:        msg.Creator,
		KeyId:          msg.KeyId,
		DataForSigning: transfer.DataForSigning,
		Status:         types.SignRequestStatus_SIGN_REQUEST_STATUS_PENDING,
	}

	id, err := k.signatureRequests.Append(ctx, req)
	if err != nil {
		return nil, err
	}

	return &types.MsgNewSignatureRequestResponse{Id: id}, nil
}
