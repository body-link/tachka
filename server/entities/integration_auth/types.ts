import { t } from '@marblejs/middleware-io';
import { Json, NonEmptyString } from 'io-ts-types';
import { PositiveInt } from '../../common/io/Positive';

export type TIntegrationAuthID = t.TypeOf<typeof PositiveInt>;

export const IntegrationAuthCreate = t.type(
  {
    integration: NonEmptyString,
    profile: NonEmptyString,
    data: Json,
  },
  'IntegrationAuthCreate'
);
export type IIntegrationAuthCreate = t.TypeOf<typeof IntegrationAuthCreate>;

export const IntegrationAuth = t.intersection(
  [
    t.type({
      id: PositiveInt,
    }),
    IntegrationAuthCreate,
  ],
  'IntegrationAuth'
);
export type IIntegrationAuth = t.TypeOf<typeof IntegrationAuth>;
export type IIntegrationAuthRefine<T> = { data: T } & IIntegrationAuth;
