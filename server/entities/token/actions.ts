import { of } from 'rxjs';
import { format } from 'date-fns';
import * as jwt from 'jsonwebtoken';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import { map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { tokenRepository$ } from './typeorm';
import { getEnvSecret } from '../../config/env';
import { isArray, isDefined } from '../../common/type-guards';
import { ETokenScope, ITokenPayload, ITokenPayloadSeed } from './types';
import { toAffected } from '../../common/utils';

const cache = new Map<string, number>();

export const generateToken$ = (payloadSeed: ITokenPayloadSeed) =>
  of(jwt.sign(payloadSeed, getEnvSecret())).pipe(
    withLatestFrom(tokenRepository$),
    mergeMap(([token, repo]) => repo.save({ jwt: token })),
    map((item) => {
      cache.set(item.jwt, item.id);
      return item.jwt;
    })
  );

export const generateClientToken$ = () =>
  generateToken$({
    name: `Login ${format(new Date(), 'yyyy/MM/dd HH:mm:ss')}`,
    scope: [ETokenScope.Client],
  });

export const removeToken$ = (token: string | NonEmptyArray<string>) => {
  const tokens = isArray(token) ? token : [token];
  const tokenIDs = tokens.map(cache.get, cache).filter(isDefined);
  return tokenRepository$.pipe(
    mergeMap((repo) => repo.delete(tokenIDs)),
    map((v) => {
      tokens.forEach(cache.delete, cache);
      return toAffected(v);
    })
  );
};

export const getAllTokens$ = () => tokenRepository$.pipe(mergeMap((repo) => repo.find()));

export const verifyToken = (token: string) => {
  if (cache.has(token)) {
    const payload = jwt.verify(token, getEnvSecret()) as ITokenPayload;
    return {
      token,
      payload,
    };
  }
  throw new Error(`Token doesn't exist`);
};

getAllTokens$().subscribe((items) => items.forEach((item) => cache.set(item.jwt, item.id)));
