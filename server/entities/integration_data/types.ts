import { t } from '@marblejs/middleware-io';
import { Json, NonEmptyString } from 'io-ts-types';

export const IntegrationData = t.type(
  {
    id: NonEmptyString,
    data: Json,
  },
  'IntegrationData'
);

export type IIntegrationData = t.TypeOf<typeof IntegrationData>;

export type IIntegrationDataRefine<T> = { data: T } & IIntegrationData;
