import { NonEmptyString } from 'io-ts-types';
import { requestValidator$, t } from '@marblejs/middleware-io';
import { HttpError, HttpStatus, r } from '@marblejs/core';
import { map, mergeMap } from 'rxjs/operators';
import { getEnvSecret } from '../../config/env';
import { toBody } from '../../common/utils';
import { generateClientToken$, removeToken$ } from '../../entities/token/actions';
import { authorizeClient$ } from '../../entities/token/middlewares';
import { parseAuthorizationHeader } from '../../entities/token/utils';
import { noop } from 'rxjs';

const validateRequestLogin = requestValidator$({
  body: t.type({
    secret: NonEmptyString,
  }),
});

export const loginEffect$ = r.pipe(
  r.matchPath('/login'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRequestLogin,
      mergeMap((req) => {
        const secret = getEnvSecret();
        if (secret === req.body.secret) {
          return generateClientToken$();
        }
        throw new HttpError('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }),
      map((token) => ({ token })),
      toBody
    )
  )
);

export const logoutEffect$ = r.pipe(
  r.matchPath('/logout'),
  r.matchType('POST'),
  r.use(authorizeClient$),
  r.useEffect((req$) =>
    req$.pipe(map(parseAuthorizationHeader), mergeMap(removeToken$), map(noop), toBody)
  )
);
