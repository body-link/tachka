import { HttpError, HttpMiddlewareEffect, HttpStatus } from '@marblejs/core';
import { mergeMap } from 'rxjs/operators';
import { isDefined } from '../common/type-guards';
import { getEnvSecret } from '../env';
import { of, throwError } from 'rxjs';

export const authorize$: HttpMiddlewareEffect = (req$) =>
  req$.pipe(
    mergeMap((req) => {
      const header = req.headers.authorization;
      if (isDefined(header) && header.replace('Bearer ', '') === getEnvSecret()) {
        return of(req);
      }
      return throwError(new HttpError('Unauthorized', HttpStatus.UNAUTHORIZED));
    })
  );
