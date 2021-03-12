import { t } from '@marblejs/middleware-io';
import { either } from 'fp-ts/Either';

export interface IUTCOffset extends t.Type<t.Int, t.Int, unknown> {}

export const UTCOffset: IUTCOffset = new t.Type<t.Int, t.Int, unknown>(
  'UTCOffset',
  t.Int.is,
  (u, c) =>
    either.chain(t.Int.validate(u, c), (n) =>
      n >= -limit && n <= limit ? t.success(n) : t.failure(u, c)
    ),
  t.identity
);

const limit = 24 * 60;
