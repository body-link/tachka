import * as cookie from 'cookie';
import { NonEmptyString } from 'io-ts-types';
import { requestValidator$, t } from '@marblejs/middleware-io';
import { HttpError, HttpStatus, r } from '@marblejs/core';
import { map } from 'rxjs/operators';
import { authorize$ } from '../middlewares';
import { getEnvSecret } from '../../config/env';
import { toBody } from '../../common/utils';

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
      map((req) => {
        const secret = getEnvSecret();
        if (secret === req.body.secret) {
          req.response.setHeader(
            'Set-Cookie',
            cookie.serialize('token', secret, {
              secure: true,
              httpOnly: true,
              sameSite: 'strict',
              maxAge: 60 * 60 * 24 * 7, // 1 week
            })
          );
          return;
        }
        throw new HttpError('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }),
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
      map((req) => {
        req.response.setHeader(
          'Set-Cookie',
          cookie.serialize('token', '', {
            secure: true,
            httpOnly: true,
            sameSite: 'strict',
            expires: new Date(0),
          })
        );
      }),
      toBody
    )
  )
);
