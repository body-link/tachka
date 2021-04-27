import { Eq } from 'fp-ts/Eq';
import * as A from 'fp-ts/Array';
import { map } from 'rxjs/operators';
import { pipe } from 'fp-ts/function';
import { TIdentifier } from './type-utils';
import { isDefined } from './type-guards';
import { DeleteResult } from 'typeorm';

export const toBody = map((body?: unknown) => ({
  body: body ?? { ok: true },
}));

export const arrayToRecord = <T1, T2 extends TIdentifier = string>(
  arr: T1[],
  getKeyName?: (item: T1) => T2
): Record<T2, T1> => {
  const hasKeyNameGetter = isDefined(getKeyName);
  return arr.reduce((acc, item) => {
    acc[
      hasKeyNameGetter ? (getKeyName as (item: T1) => T2)(item) : ((item as unknown) as T2)
    ] = item;
    return acc;
  }, {} as Record<T2, T1>);
};

export const toAffected = (v: DeleteResult) => ({ affected: v.affected });

export const groupArray = <A>(S: Eq<A>): ((as: A[]) => A[][]) => {
  return A.chop((as) => {
    const { init, rest } = pipe(
      as,
      A.spanLeft((a: A) => S.equals(a, as[0]))
    );
    return [init, rest];
  });
};
