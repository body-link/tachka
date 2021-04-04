import { r } from '@marblejs/core';
import { mergeMap } from 'rxjs/operators';
import { requestValidator$, t } from '@marblejs/middleware-io';
import { toBody } from '../../../common/utils';
import { recordRemoveByID$ } from '../../../entities/record/actions/Remove-by-id';
import { nonEmptyArray, NonEmptyString } from 'io-ts-types';

const validateRemoveByIDRequest = requestValidator$({
  body: t.union([NonEmptyString, nonEmptyArray(NonEmptyString)]),
});

export const recordRemoveByIDEffect$ = r.pipe(
  r.matchPath('/remove-by-id'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRemoveByIDRequest,
      mergeMap((req) => recordRemoveByID$(req.body)),
      toBody
    )
  )
);
