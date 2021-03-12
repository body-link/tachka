import { combineRoutes, HttpError, HttpMiddlewareEffect, HttpStatus } from '@marblejs/core';
import { recordList$ } from './external/record/list.effect';
import { recordCreate$ } from './external/record/create.effect';
import { login$, logout$ } from './internal/auth.effects';
import { mergeMap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { isDefined } from '../common/type-guards';
import { getEnvSecret } from '../env';

const authorize$: HttpMiddlewareEffect = (req$) =>
  req$.pipe(
    mergeMap((req) => {
      const header = req.headers.authorization;
      if (isDefined(header) && header.replace('Bearer ', '') === getEnvSecret()) {
        return of(req);
      }
      return throwError(new HttpError('Unauthorized', HttpStatus.UNAUTHORIZED));
    })
  );

export const api$ = combineRoutes('/', [
  combineRoutes('/', [
    login$,
    combineRoutes('/', {
      effects: [logout$],
      middlewares: [authorize$],
    }),
  ]),
  combineRoutes('/api/v1', {
    effects: [combineRoutes('/record', [recordList$, recordCreate$])],
    middlewares: [authorize$],
  }),
]);
