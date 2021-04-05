import { HttpRequest } from '@marblejs/core';

export interface ITokenPayload extends ITokenPayloadSeed {
  iat: number;
}

export interface ITokenPayloadSeed {
  name: string;
  scope: ETokenScope[];
  rg?: string[]; // Record groups for RecordByGroupInclude|RecordByGroupExclude
}

export enum ETokenScope {
  Client = 'c',
  RecordByGroupInclude = 'rgi',
  RecordByGroupExclude = 'rge',
}

export interface IHttpRequestWithTokenPayload extends HttpRequest {
  tokenPayload: ITokenPayload;
}
