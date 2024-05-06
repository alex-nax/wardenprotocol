//@ts-nocheck
import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgUpdateParams, MsgApproveAction, MsgNewIntent, MsgUpdateIntent, MsgRevokeAction } from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [["/warden.intent.MsgUpdateParams", MsgUpdateParams], ["/warden.intent.MsgApproveAction", MsgApproveAction], ["/warden.intent.MsgNewIntent", MsgNewIntent], ["/warden.intent.MsgUpdateIntent", MsgUpdateIntent], ["/warden.intent.MsgRevokeAction", MsgRevokeAction]];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: "/warden.intent.MsgUpdateParams",
        value: MsgUpdateParams.encode(value).finish()
      };
    },
    approveAction(value: MsgApproveAction) {
      return {
        typeUrl: "/warden.intent.MsgApproveAction",
        value: MsgApproveAction.encode(value).finish()
      };
    },
    newIntent(value: MsgNewIntent) {
      return {
        typeUrl: "/warden.intent.MsgNewIntent",
        value: MsgNewIntent.encode(value).finish()
      };
    },
    updateIntent(value: MsgUpdateIntent) {
      return {
        typeUrl: "/warden.intent.MsgUpdateIntent",
        value: MsgUpdateIntent.encode(value).finish()
      };
    },
    revokeAction(value: MsgRevokeAction) {
      return {
        typeUrl: "/warden.intent.MsgRevokeAction",
        value: MsgRevokeAction.encode(value).finish()
      };
    }
  },
  withTypeUrl: {
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: "/warden.intent.MsgUpdateParams",
        value
      };
    },
    approveAction(value: MsgApproveAction) {
      return {
        typeUrl: "/warden.intent.MsgApproveAction",
        value
      };
    },
    newIntent(value: MsgNewIntent) {
      return {
        typeUrl: "/warden.intent.MsgNewIntent",
        value
      };
    },
    updateIntent(value: MsgUpdateIntent) {
      return {
        typeUrl: "/warden.intent.MsgUpdateIntent",
        value
      };
    },
    revokeAction(value: MsgRevokeAction) {
      return {
        typeUrl: "/warden.intent.MsgRevokeAction",
        value
      };
    }
  },
  toJSON: {
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: "/warden.intent.MsgUpdateParams",
        value: MsgUpdateParams.toJSON(value)
      };
    },
    approveAction(value: MsgApproveAction) {
      return {
        typeUrl: "/warden.intent.MsgApproveAction",
        value: MsgApproveAction.toJSON(value)
      };
    },
    newIntent(value: MsgNewIntent) {
      return {
        typeUrl: "/warden.intent.MsgNewIntent",
        value: MsgNewIntent.toJSON(value)
      };
    },
    updateIntent(value: MsgUpdateIntent) {
      return {
        typeUrl: "/warden.intent.MsgUpdateIntent",
        value: MsgUpdateIntent.toJSON(value)
      };
    },
    revokeAction(value: MsgRevokeAction) {
      return {
        typeUrl: "/warden.intent.MsgRevokeAction",
        value: MsgRevokeAction.toJSON(value)
      };
    }
  },
  fromJSON: {
    updateParams(value: any) {
      return {
        typeUrl: "/warden.intent.MsgUpdateParams",
        value: MsgUpdateParams.fromJSON(value)
      };
    },
    approveAction(value: any) {
      return {
        typeUrl: "/warden.intent.MsgApproveAction",
        value: MsgApproveAction.fromJSON(value)
      };
    },
    newIntent(value: any) {
      return {
        typeUrl: "/warden.intent.MsgNewIntent",
        value: MsgNewIntent.fromJSON(value)
      };
    },
    updateIntent(value: any) {
      return {
        typeUrl: "/warden.intent.MsgUpdateIntent",
        value: MsgUpdateIntent.fromJSON(value)
      };
    },
    revokeAction(value: any) {
      return {
        typeUrl: "/warden.intent.MsgRevokeAction",
        value: MsgRevokeAction.fromJSON(value)
      };
    }
  },
  fromPartial: {
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: "/warden.intent.MsgUpdateParams",
        value: MsgUpdateParams.fromPartial(value)
      };
    },
    approveAction(value: MsgApproveAction) {
      return {
        typeUrl: "/warden.intent.MsgApproveAction",
        value: MsgApproveAction.fromPartial(value)
      };
    },
    newIntent(value: MsgNewIntent) {
      return {
        typeUrl: "/warden.intent.MsgNewIntent",
        value: MsgNewIntent.fromPartial(value)
      };
    },
    updateIntent(value: MsgUpdateIntent) {
      return {
        typeUrl: "/warden.intent.MsgUpdateIntent",
        value: MsgUpdateIntent.fromPartial(value)
      };
    },
    revokeAction(value: MsgRevokeAction) {
      return {
        typeUrl: "/warden.intent.MsgRevokeAction",
        value: MsgRevokeAction.fromPartial(value)
      };
    }
  }
};