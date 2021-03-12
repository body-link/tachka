import { t } from '@marblejs/middleware-io';
import { either } from 'fp-ts/Either';
import { IntFromString } from 'io-ts-types';

export interface IUnixTime extends t.Type<t.Int, t.Int, unknown> {}

export const UnixTime: IUnixTime = new t.Type<t.Int, t.Int, unknown>(
  'UnixTime',
  t.Int.is,
  (u, c) =>
    either.chain(t.Int.validate(u, c), (n) =>
      n > 0 && n < 2147483647 ? t.success(n) : t.failure(u, c)
    ),
  t.identity
);

export interface IUnixTimeFromString extends t.Type<t.Int, string, unknown> {}

export const UnixTimeFromString: IUnixTimeFromString = IntFromString.pipe(
  UnixTime,
  'UnixTimeFromString'
);
