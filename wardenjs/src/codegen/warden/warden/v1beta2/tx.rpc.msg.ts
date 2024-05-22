//@ts-nocheck
import { Rpc } from "../../../helpers.js";
import _m0 from "protobufjs/minimal.js";
import { MsgUpdateParams, MsgUpdateParamsResponse, MsgNewSpace, MsgNewSpaceResponse, MsgAddSpaceOwner, MsgRemoveSpaceOwner, MsgNewKeychain, MsgNewKeychainResponse, MsgAddKeychainParty, MsgAddKeychainPartyResponse, MsgUpdateSpace, MsgUpdateKeychain, MsgUpdateKeychainResponse, MsgNewKeyRequest, MsgUpdateKeyRequest, MsgUpdateKeyRequestResponse, MsgUpdateKey, MsgNewSignatureRequest, MsgFulfilSignatureRequest, MsgFulfilSignatureRequestResponse } from "./tx.js";
import { MsgActionCreated } from "../../intent/action.js";
/** Msg defines the Msg service. */
export interface Msg {
  /**
   * UpdateParams defines a (governance) operation for updating the module
   * parameters. The authority defaults to the x/gov module account.
   */
  updateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse>;
  /** Create a new Space. The creator will be the first owner of the Space. */
  newSpace(request: MsgNewSpace): Promise<MsgNewSpaceResponse>;
  /** Add a new owner to a space. */
  addSpaceOwner(request: MsgAddSpaceOwner): Promise<MsgActionCreated>;
  /**
   * Remove an owner from the space. The user can remove itself, but at
   * least one owner must be left.
   */
  removeSpaceOwner(request: MsgRemoveSpaceOwner): Promise<MsgActionCreated>;
  /** Create a new keychain. The user will be the first admin of the keychain. */
  newKeychain(request: MsgNewKeychain): Promise<MsgNewKeychainResponse>;
  /**
   * Add a new party to a keychain. Transactions coming from this party will
   * be considered trusted by the keychain.
   */
  addKeychainParty(request: MsgAddKeychainParty): Promise<MsgAddKeychainPartyResponse>;
  /** Update a space, e.g. changing the intents in use. */
  updateSpace(request: MsgUpdateSpace): Promise<MsgActionCreated>;
  /** Update a keychain, e.g. update the status or description. */
  updateKeychain(request: MsgUpdateKeychain): Promise<MsgUpdateKeychainResponse>;
  /**
   * Request a new key to a keychain, the key will belong to the specified
   * space.
   */
  newKeyRequest(request: MsgNewKeyRequest): Promise<MsgActionCreated>;
  /**
   * Update an existing request by writing a result into it. This method is
   * called by a keychain party.
   */
  updateKeyRequest(request: MsgUpdateKeyRequest): Promise<MsgUpdateKeyRequestResponse>;
  /** Update informations of a Key. */
  updateKey(request: MsgUpdateKey): Promise<MsgActionCreated>;
  /** Request a new signature */
  newSignatureRequest(request: MsgNewSignatureRequest): Promise<MsgActionCreated>;
  /** Fulfill a signature request */
  fulfilSignatureRequest(request: MsgFulfilSignatureRequest): Promise<MsgFulfilSignatureRequestResponse>;
}
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.updateParams = this.updateParams.bind(this);
    this.newSpace = this.newSpace.bind(this);
    this.addSpaceOwner = this.addSpaceOwner.bind(this);
    this.removeSpaceOwner = this.removeSpaceOwner.bind(this);
    this.newKeychain = this.newKeychain.bind(this);
    this.addKeychainParty = this.addKeychainParty.bind(this);
    this.updateSpace = this.updateSpace.bind(this);
    this.updateKeychain = this.updateKeychain.bind(this);
    this.newKeyRequest = this.newKeyRequest.bind(this);
    this.updateKeyRequest = this.updateKeyRequest.bind(this);
    this.updateKey = this.updateKey.bind(this);
    this.newSignatureRequest = this.newSignatureRequest.bind(this);
    this.fulfilSignatureRequest = this.fulfilSignatureRequest.bind(this);
  }
  updateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse> {
    const data = MsgUpdateParams.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "UpdateParams", data);
    return promise.then(data => MsgUpdateParamsResponse.decode(new _m0.Reader(data)));
  }
  newSpace(request: MsgNewSpace): Promise<MsgNewSpaceResponse> {
    const data = MsgNewSpace.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "NewSpace", data);
    return promise.then(data => MsgNewSpaceResponse.decode(new _m0.Reader(data)));
  }
  addSpaceOwner(request: MsgAddSpaceOwner): Promise<MsgActionCreated> {
    const data = MsgAddSpaceOwner.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "AddSpaceOwner", data);
    return promise.then(data => MsgActionCreated.decode(new _m0.Reader(data)));
  }
  removeSpaceOwner(request: MsgRemoveSpaceOwner): Promise<MsgActionCreated> {
    const data = MsgRemoveSpaceOwner.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "RemoveSpaceOwner", data);
    return promise.then(data => MsgActionCreated.decode(new _m0.Reader(data)));
  }
  newKeychain(request: MsgNewKeychain): Promise<MsgNewKeychainResponse> {
    const data = MsgNewKeychain.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "NewKeychain", data);
    return promise.then(data => MsgNewKeychainResponse.decode(new _m0.Reader(data)));
  }
  addKeychainParty(request: MsgAddKeychainParty): Promise<MsgAddKeychainPartyResponse> {
    const data = MsgAddKeychainParty.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "AddKeychainParty", data);
    return promise.then(data => MsgAddKeychainPartyResponse.decode(new _m0.Reader(data)));
  }
  updateSpace(request: MsgUpdateSpace): Promise<MsgActionCreated> {
    const data = MsgUpdateSpace.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "UpdateSpace", data);
    return promise.then(data => MsgActionCreated.decode(new _m0.Reader(data)));
  }
  updateKeychain(request: MsgUpdateKeychain): Promise<MsgUpdateKeychainResponse> {
    const data = MsgUpdateKeychain.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "UpdateKeychain", data);
    return promise.then(data => MsgUpdateKeychainResponse.decode(new _m0.Reader(data)));
  }
  newKeyRequest(request: MsgNewKeyRequest): Promise<MsgActionCreated> {
    const data = MsgNewKeyRequest.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "NewKeyRequest", data);
    return promise.then(data => MsgActionCreated.decode(new _m0.Reader(data)));
  }
  updateKeyRequest(request: MsgUpdateKeyRequest): Promise<MsgUpdateKeyRequestResponse> {
    const data = MsgUpdateKeyRequest.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "UpdateKeyRequest", data);
    return promise.then(data => MsgUpdateKeyRequestResponse.decode(new _m0.Reader(data)));
  }
  updateKey(request: MsgUpdateKey): Promise<MsgActionCreated> {
    const data = MsgUpdateKey.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "UpdateKey", data);
    return promise.then(data => MsgActionCreated.decode(new _m0.Reader(data)));
  }
  newSignatureRequest(request: MsgNewSignatureRequest): Promise<MsgActionCreated> {
    const data = MsgNewSignatureRequest.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "NewSignatureRequest", data);
    return promise.then(data => MsgActionCreated.decode(new _m0.Reader(data)));
  }
  fulfilSignatureRequest(request: MsgFulfilSignatureRequest): Promise<MsgFulfilSignatureRequestResponse> {
    const data = MsgFulfilSignatureRequest.encode(request).finish();
    const promise = this.rpc.request("warden.warden.v1beta2.Msg", "FulfilSignatureRequest", data);
    return promise.then(data => MsgFulfilSignatureRequestResponse.decode(new _m0.Reader(data)));
  }
}