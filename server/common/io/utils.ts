import { t } from '@marblejs/middleware-io';
import { withValidate } from 'io-ts-types';
import { either } from 'fp-ts/Either';

export const optional = <T extends t.Any>(
  type: T,
  name = `${type.name} | undefined`
): t.UnionType<
  [T, t.UndefinedType],
  t.TypeOf<T> | undefined,
  t.OutputOf<T> | undefined,
  t.InputOf<T> | undefined
> => t.union<[T, t.UndefinedType]>([type, t.undefined], name);

export const refine = <C extends t.Any, T = t.TypeOf<C>>(
  codec: C,
  check: (x: T) => void | string
) =>
  withValidate(codec, (i, c) =>
    either.chain(codec.validate(i, c), (value) => {
      const result = check(value);
      return typeof result === 'string' ? t.failure(value, c, result) : t.success(value);
    })
  );
