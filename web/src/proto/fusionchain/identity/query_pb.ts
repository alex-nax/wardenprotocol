// @generated by protoc-gen-es v1.3.0 with parameter "target=ts"
// @generated from file fusionchain/identity/query.proto (package fusionchain.identity, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";
import { Params } from "./params_pb.js";
import { PageRequest, PageResponse } from "../../cosmos/base/query/v1beta1/pagination_pb.js";
import { Workspace } from "./workspace_pb.js";
import { Keyring } from "./keyring_pb.js";

/**
 * QueryParamsRequest is request type for the Query/Params RPC method.
 *
 * @generated from message fusionchain.identity.QueryParamsRequest
 */
export class QueryParamsRequest extends Message<QueryParamsRequest> {
  constructor(data?: PartialMessage<QueryParamsRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "fusionchain.identity.QueryParamsRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): QueryParamsRequest {
    return new QueryParamsRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): QueryParamsRequest {
    return new QueryParamsRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): QueryParamsRequest {
    return new QueryParamsRequest().fromJsonString(jsonString, options);
  }

  static equals(a: QueryParamsRequest | PlainMessage<QueryParamsRequest> | undefined, b: QueryParamsRequest | PlainMessage<QueryParamsRequest> | undefined): boolean {
    return proto3.util.equals(QueryParamsRequest, a, b);
  }
}

/**
 * QueryParamsResponse is response type for the Query/Params RPC method.
 *
 * @generated from message fusionchain.identity.QueryParamsResponse
 */
export class QueryParamsResponse extends Message<QueryParamsResponse> {
  /**
   * params holds all the parameters of this module.
   *
   * @generated from field: fusionchain.identity.Params params = 1;
   */
  params?: Params;

  constructor(data?: PartialMessage<QueryParamsResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "fusionchain.identity.QueryParamsResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "params", kind: "message", T: Params },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): QueryParamsResponse {
    return new QueryParamsResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): QueryParamsResponse {
    return new QueryParamsResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): QueryParamsResponse {
    return new QueryParamsResponse().fromJsonString(jsonString, options);
  }

  static equals(a: QueryParamsResponse | PlainMessage<QueryParamsResponse> | undefined, b: QueryParamsResponse | PlainMessage<QueryParamsResponse> | undefined): boolean {
    return proto3.util.equals(QueryParamsResponse, a, b);
  }
}

/**
 * @generated from message fusionchain.identity.QueryWorkspacesRequest
 */
export class QueryWorkspacesRequest extends Message<QueryWorkspacesRequest> {
  /**
   * @generated from field: cosmos.base.query.v1beta1.PageRequest pagination = 1;
   */
  pagination?: PageRequest;

  constructor(data?: PartialMessage<QueryWorkspacesRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "fusionchain.identity.QueryWorkspacesRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "pagination", kind: "message", T: PageRequest },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): QueryWorkspacesRequest {
    return new QueryWorkspacesRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): QueryWorkspacesRequest {
    return new QueryWorkspacesRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): QueryWorkspacesRequest {
    return new QueryWorkspacesRequest().fromJsonString(jsonString, options);
  }

  static equals(a: QueryWorkspacesRequest | PlainMessage<QueryWorkspacesRequest> | undefined, b: QueryWorkspacesRequest | PlainMessage<QueryWorkspacesRequest> | undefined): boolean {
    return proto3.util.equals(QueryWorkspacesRequest, a, b);
  }
}

/**
 * @generated from message fusionchain.identity.QueryWorkspacesResponse
 */
export class QueryWorkspacesResponse extends Message<QueryWorkspacesResponse> {
  /**
   * @generated from field: cosmos.base.query.v1beta1.PageResponse pagination = 1;
   */
  pagination?: PageResponse;

  /**
   * @generated from field: repeated fusionchain.identity.Workspace workspaces = 2;
   */
  workspaces: Workspace[] = [];

  constructor(data?: PartialMessage<QueryWorkspacesResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "fusionchain.identity.QueryWorkspacesResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "pagination", kind: "message", T: PageResponse },
    { no: 2, name: "workspaces", kind: "message", T: Workspace, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): QueryWorkspacesResponse {
    return new QueryWorkspacesResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): QueryWorkspacesResponse {
    return new QueryWorkspacesResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): QueryWorkspacesResponse {
    return new QueryWorkspacesResponse().fromJsonString(jsonString, options);
  }

  static equals(a: QueryWorkspacesResponse | PlainMessage<QueryWorkspacesResponse> | undefined, b: QueryWorkspacesResponse | PlainMessage<QueryWorkspacesResponse> | undefined): boolean {
    return proto3.util.equals(QueryWorkspacesResponse, a, b);
  }
}

/**
 * @generated from message fusionchain.identity.QueryWorkspacesByOwnerRequest
 */
export class QueryWorkspacesByOwnerRequest extends Message<QueryWorkspacesByOwnerRequest> {
  /**
   * @generated from field: cosmos.base.query.v1beta1.PageRequest pagination = 1;
   */
  pagination?: PageRequest;

  /**
   * @generated from field: string owner = 2;
   */
  owner = "";

  constructor(data?: PartialMessage<QueryWorkspacesByOwnerRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "fusionchain.identity.QueryWorkspacesByOwnerRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "pagination", kind: "message", T: PageRequest },
    { no: 2, name: "owner", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): QueryWorkspacesByOwnerRequest {
    return new QueryWorkspacesByOwnerRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): QueryWorkspacesByOwnerRequest {
    return new QueryWorkspacesByOwnerRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): QueryWorkspacesByOwnerRequest {
    return new QueryWorkspacesByOwnerRequest().fromJsonString(jsonString, options);
  }

  static equals(a: QueryWorkspacesByOwnerRequest | PlainMessage<QueryWorkspacesByOwnerRequest> | undefined, b: QueryWorkspacesByOwnerRequest | PlainMessage<QueryWorkspacesByOwnerRequest> | undefined): boolean {
    return proto3.util.equals(QueryWorkspacesByOwnerRequest, a, b);
  }
}

/**
 * @generated from message fusionchain.identity.QueryKeyringsRequest
 */
export class QueryKeyringsRequest extends Message<QueryKeyringsRequest> {
  /**
   * @generated from field: cosmos.base.query.v1beta1.PageRequest pagination = 1;
   */
  pagination?: PageRequest;

  constructor(data?: PartialMessage<QueryKeyringsRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "fusionchain.identity.QueryKeyringsRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "pagination", kind: "message", T: PageRequest },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): QueryKeyringsRequest {
    return new QueryKeyringsRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): QueryKeyringsRequest {
    return new QueryKeyringsRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): QueryKeyringsRequest {
    return new QueryKeyringsRequest().fromJsonString(jsonString, options);
  }

  static equals(a: QueryKeyringsRequest | PlainMessage<QueryKeyringsRequest> | undefined, b: QueryKeyringsRequest | PlainMessage<QueryKeyringsRequest> | undefined): boolean {
    return proto3.util.equals(QueryKeyringsRequest, a, b);
  }
}

/**
 * @generated from message fusionchain.identity.QueryKeyringsResponse
 */
export class QueryKeyringsResponse extends Message<QueryKeyringsResponse> {
  /**
   * @generated from field: cosmos.base.query.v1beta1.PageResponse pagination = 1;
   */
  pagination?: PageResponse;

  /**
   * @generated from field: repeated fusionchain.identity.Keyring keyrings = 2;
   */
  keyrings: Keyring[] = [];

  constructor(data?: PartialMessage<QueryKeyringsResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "fusionchain.identity.QueryKeyringsResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "pagination", kind: "message", T: PageResponse },
    { no: 2, name: "keyrings", kind: "message", T: Keyring, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): QueryKeyringsResponse {
    return new QueryKeyringsResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): QueryKeyringsResponse {
    return new QueryKeyringsResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): QueryKeyringsResponse {
    return new QueryKeyringsResponse().fromJsonString(jsonString, options);
  }

  static equals(a: QueryKeyringsResponse | PlainMessage<QueryKeyringsResponse> | undefined, b: QueryKeyringsResponse | PlainMessage<QueryKeyringsResponse> | undefined): boolean {
    return proto3.util.equals(QueryKeyringsResponse, a, b);
  }
}

/**
 * @generated from message fusionchain.identity.QueryWorkspaceByAddressRequest
 */
export class QueryWorkspaceByAddressRequest extends Message<QueryWorkspaceByAddressRequest> {
  /**
   * @generated from field: string address = 1;
   */
  address = "";

  constructor(data?: PartialMessage<QueryWorkspaceByAddressRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "fusionchain.identity.QueryWorkspaceByAddressRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "address", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): QueryWorkspaceByAddressRequest {
    return new QueryWorkspaceByAddressRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): QueryWorkspaceByAddressRequest {
    return new QueryWorkspaceByAddressRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): QueryWorkspaceByAddressRequest {
    return new QueryWorkspaceByAddressRequest().fromJsonString(jsonString, options);
  }

  static equals(a: QueryWorkspaceByAddressRequest | PlainMessage<QueryWorkspaceByAddressRequest> | undefined, b: QueryWorkspaceByAddressRequest | PlainMessage<QueryWorkspaceByAddressRequest> | undefined): boolean {
    return proto3.util.equals(QueryWorkspaceByAddressRequest, a, b);
  }
}

/**
 * @generated from message fusionchain.identity.QueryWorkspaceByAddressResponse
 */
export class QueryWorkspaceByAddressResponse extends Message<QueryWorkspaceByAddressResponse> {
  /**
   * @generated from field: fusionchain.identity.Workspace workspace = 1;
   */
  workspace?: Workspace;

  constructor(data?: PartialMessage<QueryWorkspaceByAddressResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "fusionchain.identity.QueryWorkspaceByAddressResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "workspace", kind: "message", T: Workspace },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): QueryWorkspaceByAddressResponse {
    return new QueryWorkspaceByAddressResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): QueryWorkspaceByAddressResponse {
    return new QueryWorkspaceByAddressResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): QueryWorkspaceByAddressResponse {
    return new QueryWorkspaceByAddressResponse().fromJsonString(jsonString, options);
  }

  static equals(a: QueryWorkspaceByAddressResponse | PlainMessage<QueryWorkspaceByAddressResponse> | undefined, b: QueryWorkspaceByAddressResponse | PlainMessage<QueryWorkspaceByAddressResponse> | undefined): boolean {
    return proto3.util.equals(QueryWorkspaceByAddressResponse, a, b);
  }
}
