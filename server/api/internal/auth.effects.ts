import { r } from '@marblejs/core';
import { map } from 'rxjs/operators';
import { toBody } from '../../common/utils';

export const login$ = r.pipe(
  r.matchPath('/login'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      map(() => ({ token: '1234' })),
      toBody
    )
  )
);

export const logout$ = r.pipe(
  r.matchPath('/logout'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      map(() => ({ token: null })),
      toBody
    )
  )
);
