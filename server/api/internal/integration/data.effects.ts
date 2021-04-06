import { r } from '@marblejs/core';
import { requestValidator$ } from '@marblejs/middleware-io';
import { throwError } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { NonEmptyString } from 'io-ts-types';
import { arrayToRecord, toBody } from '../../../common/utils';
import { integrationStateReg } from '../../../integrations/common/IntegrationState';
import { IntegrationData } from '../../../entities/integration_data/types';
import {
  IntegrationDataEntityFromIntegrationData,
  integrationDataRepository$,
} from '../../../entities/integration_data/typeorm';

export const integrationDataListEffect$ = r.pipe(
  r.matchPath('/list'),
  r.matchType('GET'),
  r.useEffect((req$) =>
    req$.pipe(
      mergeMap(() =>
        integrationDataRepository$.pipe(
          mergeMap((repo) => repo.find()),
          map((items) => {
            const itemsByID = arrayToRecord(
              items.map(IntegrationDataEntityFromIntegrationData.encode),
              (item) => item.id as string
            );
            return [...integrationStateReg.values()].map((integration) => ({
              id: integration.id,
              data: itemsByID[integration.id]?.data,
              schema: integration.schemaOptions.JSONSchema,
            }));
          })
        )
      ),
      toBody
    )
  )
);

const validateSetRequest = requestValidator$({
  body: IntegrationData,
});

export const integrationDataSetEffect$ = r.pipe(
  r.matchPath('/set'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateSetRequest,
      mergeMap(({ body: { id, data } }) =>
        pipe(
          O.fromNullable(integrationStateReg.get(id)),
          O.fold(
            () => throwError(new Error(`Integration ${id} doesn't exist`)),
            (integration) => integration.setData$(data)
          )
        )
      ),
      toBody
    )
  )
);

const validateRemoveRequest = requestValidator$({
  body: NonEmptyString,
});

export const integrationDataRemoveEffect$ = r.pipe(
  r.matchPath('/remove'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRemoveRequest,
      mergeMap(({ body: id }) =>
        pipe(
          O.fromNullable(integrationStateReg.get(id)),
          O.fold(
            () => throwError(new Error(`Integration ${id} doesn't exist`)),
            (integration) => integration.removeData$()
          )
        )
      ),
      toBody
    )
  )
);
