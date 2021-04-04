import { r } from '@marblejs/core';
import { mergeMap } from 'rxjs/operators';
import { requestValidator$ } from '@marblejs/middleware-io';
import { toBody } from '../../../common/utils';
import {
  recordGetByID$,
  recordGetByIDOptions,
  recordGetByIDs$,
  recordGetByIDsOptions,
} from '../../../entities/record/actions/get-by-id';

const validateGetByIDRequest = requestValidator$({
  body: recordGetByIDOptions,
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

const validateGetByIDsRequest = requestValidator$({
  body: recordGetByIDsOptions,
});

export const recordGetByIDsEffect$ = r.pipe(
  r.matchPath('/get-by-ids'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateGetByIDsRequest,
      mergeMap((req) => recordGetByIDs$(req.body)),
      toBody
    )
  )
);
