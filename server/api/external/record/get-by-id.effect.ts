import { r } from '@marblejs/core';
import { mergeMap } from 'rxjs/operators';
import { requestValidator$, t } from '@marblejs/middleware-io';
import { toBody } from '../../../common/utils';
import { recordGetByID$ } from '../../../entities/record/actions/get-by-id';
import { nonEmptyArray, NonEmptyString } from 'io-ts-types';

const validateGetByIDRequest = requestValidator$({
  body: t.union([NonEmptyString, nonEmptyArray(NonEmptyString)]),
});

export const recordGetByIDEffect$ = r.pipe(
  r.matchPath('/get-by-id'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateGetByIDRequest,
      mergeMap((req) => recordGetByID$(req.body)),
      toBody
    )
  )
);
