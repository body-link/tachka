import { r } from '@marblejs/core';
import { map } from 'rxjs/operators';
import { toBody } from '../../common/utils';
import { authorize$ } from '../middlewares';

export const loginEffect$ = r.pipe(
  r.matchPath('/login'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      map(() => ({ token: '1234' })),
      toBody
    )
  )
);

export const logoutEffect$ = r.pipe(
  r.matchPath('/logout'),
  r.matchType('POST'),
  r.use(authorize$),
  r.useEffect((req$) =>
    req$.pipe(
      map(() => ({ token: null })),
      toBody
    )
  )
);
