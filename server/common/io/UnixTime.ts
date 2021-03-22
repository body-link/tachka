import { t } from '@marblejs/middleware-io';
import { NumberFromString } from 'io-ts-types';

export interface IUnixTimeBrand {
  readonly UnixTime: unique symbol;
}

export type IUnixTime = t.Branded<t.Int, IUnixTimeBrand>;

export const UnixTime = t.brand(t.Int, (n): n is IUnixTime => n > 0 && n < 2147483647, 'UnixTime');

export const UnixTimeFromString = NumberFromString.pipe(UnixTime, 'UnixTimeFromString');
