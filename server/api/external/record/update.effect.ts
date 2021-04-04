import { r } from '@marblejs/core';
import { mergeMap } from 'rxjs/operators';
import { requestValidator$ } from '@marblejs/middleware-io';
import { toBody } from '../../../common/utils';
import { RecordUpdate } from '../../../entities/record/types';
import { recordUpdate$ } from '../../../entities/record/actions/update';

const validateRequest = requestValidator$({
  body: RecordUpdate,
});

export const recordUpdateEffect$ = r.pipe(
  r.matchPath('/update'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRequest,
      mergeMap((req) => recordUpdate$(req.body)),
      toBody
    )
  )
);
