import { t } from '@marblejs/middleware-io';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { failure } from 'io-ts/PathReporter';
import { NonEmptyString, withValidate } from 'io-ts-types';
import { nanoid } from 'nanoid';
import { getUnixTime, fromUnixTime } from 'date-fns';
import { IUnixTime } from './UnixTime';
import { ISlug } from './Slug';

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
    E.either.chain(codec.validate(i, c), (value) => {
      const result = check(value);
      return typeof result === 'string' ? t.failure(value, c, result) : t.success(value);
    })
  );

export const decodeWith = <DataC extends t.Mixed>(codec: DataC) => (
  input: t.InputOf<DataC>
): t.TypeOf<DataC> =>
  pipe(
    codec.decode(input),
    E.getOrElseW((errors) => {
      throw new Error(failure(errors).join('\n'));
    })
  );

export const generateID = () => nanoid() as NonEmptyString;

export const dateToTimestamp = (date: Date) => getUnixTime(date) as IUnixTime;

export const timestampToDate = (timestamp: IUnixTime) => fromUnixTime(timestamp);

// TODO: make it compatible with ISlug regex
export const stringToSlug = (str: string) => str.replace(/\s+/g, '-').toLowerCase() as ISlug;
