import { of, throwError } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { HttpError, HttpMiddlewareEffect, HttpRequest, HttpStatus } from '@marblejs/core';
import { verifyToken } from './actions';
import { isError } from '../../common/type-guards';
import { ETokenScope, IHttpRequestWithTokenPayload } from './types';
import { parseAuthorizationHeader } from './utils';

const authorize = (req: HttpRequest) =>
  of(req).pipe(
    map(parseAuthorizationHeader),
    map(verifyToken),
    map(({ payload }) => {
      req.tokenPayload = payload;
      return req as IHttpRequestWithTokenPayload;
    }),
    catchError((err) =>
      throwError(
        new HttpError(isError(err) ? err.message : 'Unauthorized', HttpStatus.UNAUTHORIZED)
      )
    )
  );

export const authorizeClient$: HttpMiddlewareEffect = (req$) =>
  req$.pipe(
    mergeMap(authorize),
    tap((req) => {
      if (!req.tokenPayload.scope.includes(ETokenScope.Client)) {
        throw new HttpError(
          'Need Client permissions to access this resource',
          HttpStatus.FORBIDDEN
        );
      }
    })
  );

export const authorizeAny$: HttpMiddlewareEffect = (req$) => req$.pipe(mergeMap(authorize));
