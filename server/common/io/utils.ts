import dedent from 'ts-dedent';
import { t } from '@marblejs/middleware-io';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { failure } from 'io-ts/PathReporter';
import { NonEmptyString, withValidate } from 'io-ts-types';
import { nanoid } from 'nanoid';
import { fromUnixTime, getUnixTime } from 'date-fns';
import { IUnixTime } from './UnixTime';
import { ISlug } from './Slug';
import { isNull } from '../type-guards';
import { IUTCOffset } from './UTCOffset';

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

export const timezoneGMTtoOffset = (timezoneGMT: string) => {
  const res = timezoneGMT.match(/([-+])(\d{2}):(\d{2})/);
  if (isNull(res)) {
    throw new Error(dedent`
      Failed to parse GMT timezone
      The format should be GMT+03:00
      The value was received ${timezoneGMT}
    `);
  }
  const sign = res[1];
  const hours = parseInt(res[2]);
  const minutes = parseInt(res[3]);
  return (Math.round(hours * 60 + minutes) * (sign === '+' ? -1 : 1)) as IUTCOffset;
};

export const anythingToJsonCompatible = (data: unknown) => JSON.parse(JSON.stringify(data));
