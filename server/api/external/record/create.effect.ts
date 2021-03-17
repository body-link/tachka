import { r } from '@marblejs/core';
import { mergeMap } from 'rxjs/operators';
import { requestValidator$ } from '@marblejs/middleware-io';
import { toBody } from '../../../common/utils';
import { recordCreate$, recordCreateOptions } from '../../../entities/record/actions/create';

const validateRequest = requestValidator$({
  body: recordCreateOptions,
});

export const recordCreateEffect$ = r.pipe(
  r.matchPath('/create'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRequest,
      mergeMap((req) => recordCreate$(req.body)),
      toBody
    )
  )
);
