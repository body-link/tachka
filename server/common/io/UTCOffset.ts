import { t } from '@marblejs/middleware-io';

const limit = 24 * 60;

export interface IUTCOffsetBrand {
  readonly UTCOffset: unique symbol;
}

export type IUTCOffset = t.Branded<t.Int, IUTCOffsetBrand>;

export const UTCOffset = t.brand(
  t.Int,
  (n): n is IUTCOffset => n >= -limit && n <= limit,
  'UTCOffset'
);
