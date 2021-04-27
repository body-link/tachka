import { r } from '@marblejs/core';
import { requestValidator$ } from '@marblejs/middleware-io';
import { mergeMap } from 'rxjs/operators';
import { toBody } from '../../../common/utils';
import {
  integrationAuthGetAll$,
  integrationAuthRemoveByID$,
  integrationAuthSave$,
} from '../../../entities/integration_auth/actions/crud';
import { IntegrationAuth, IntegrationAuthCreate } from '../../../entities/integration_auth/types';
import { PositiveInt } from '../../../common/io/Positive';

export const integrationAuthListEffect$ = r.pipe(
  r.matchPath('/list'),
  r.matchType('GET'),
  r.useEffect((req$) => req$.pipe(mergeMap(integrationAuthGetAll$), toBody))
);

const validateCreateRequest = requestValidator$({
  body: IntegrationAuthCreate,
});

export const integrationAuthCreateEffect$ = r.pipe(
  r.matchPath('/create'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateCreateRequest,
      mergeMap(({ body }) => integrationAuthSave$(body)),
      toBody
    )
  )
);

const validateUpdateRequest = requestValidator$({
  body: IntegrationAuth,
});

export const integrationAuthUpdateEffect$ = r.pipe(
  r.matchPath('/update'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateUpdateRequest,
      mergeMap(({ body }) => integrationAuthSave$(body)),
      toBody
    )
  )
);

const validateRemoveRequest = requestValidator$({
  body: PositiveInt,
});

export const integrationAuthRemoveEffect$ = r.pipe(
  r.matchPath('/remove'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRemoveRequest,
      mergeMap(({ body }) => integrationAuthRemoveByID$(body)),
      toBody
    )
  )
);
