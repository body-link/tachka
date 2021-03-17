import { t } from '@marblejs/middleware-io';
import { Json, NonEmptyString } from 'io-ts-types';
import { Slug } from '../../common/io/Slug';
import { PositiveInt } from '../../common/io/Positive';

export const IntegrationAuth = t.type(
  {
    id: PositiveInt,
    integration: Slug,
    profile: NonEmptyString,
    data: Json,
  },
  'IntegrationAuth'
);

export type IIntegrationAuth = t.TypeOf<typeof IntegrationAuth>;

export type IIntegrationAuthRefine<T> = { data: T } & IIntegrationAuth;
