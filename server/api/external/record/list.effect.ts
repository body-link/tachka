import { r } from '@marblejs/core';
import { mergeMap } from 'rxjs/operators';
import { requestValidator$ } from '@marblejs/middleware-io';
import { toBody } from '../../../common/utils';
import { recordList$, recordListOptions } from '../../../entities/record/actions/list';

const validateRequest = requestValidator$({
  query: recordListOptions,
});

export const recordListEffect$ = r.pipe(
  r.matchPath('/list'),
  r.matchType('GET'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRequest,
      mergeMap((req) => recordList$(req.query)),
      toBody
    )
  )
);
