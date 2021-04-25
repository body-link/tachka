import reporter from 'io-ts-reporters';
import { mapTo } from 'rxjs/operators';
import { r } from '@marblejs/core';
import { requestValidator$ } from '@marblejs/middleware-io';
import { toBody } from '../../../common/utils';
import { recordCreateOptions } from '../../../entities/record/actions/create';

const validateRequest = requestValidator$(
  {
    body: recordCreateOptions,
  },
  { reporter }
);

export const recordValidateEffect$ = r.pipe(
  r.matchPath('/validate'),
  r.matchType('POST'),
  r.useEffect((req$) => req$.pipe(validateRequest, mapTo(undefined), toBody))
);
