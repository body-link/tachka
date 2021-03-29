import * as cookie from 'cookie';
import { of, throwError } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpError, HttpMiddlewareEffect, HttpStatus } from '@marblejs/core';
import { isDefined } from '../common/type-guards';
import { getEnvSecret } from '../config/env';
import { TOption } from '../common/type-utils';

export const authorize$: HttpMiddlewareEffect = (req$) =>
  req$.pipe(
    mergeMap((req) => {
      const { authorization, cookie: cookieHeader } = req.headers;
      let token: TOption<string>;
      if (isDefined(authorization)) {
        token = authorization.replace('Bearer ', '');
      } else if (isDefined(cookieHeader)) {
        token = cookie.parse(cookieHeader).token;
      }
      if (token === getEnvSecret()) {
        return of(req);
      }
      return throwError(new HttpError('Unauthorized', HttpStatus.UNAUTHORIZED));
    })
  );
