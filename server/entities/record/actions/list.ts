import { t } from '@marblejs/middleware-io';
import { IntFromString } from 'io-ts-types';
import { Between, Equal, FindManyOptions, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { optional, refine } from '../../../common/io/utils';
import { Slug } from '../../../common/io/Slug';
import { UnixTimeFromString } from '../../../common/io/UnixTime';
import { isDefined } from '../../../common/type-guards';
import { RecordEntity, RecordEntityFromRecord, recordRepository$ } from '../typeorm';
import { map, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IRecord } from '../types';
import { IResultsWithCount } from '../../../common/type-utils';

export const recordListOptions = t.type({
  page: optional(
    refine(IntFromString, (x) => {
      if (x <= 0) {
        return 'must be greater than 1 or equal to 1';
      }
    })
  ),
  limit: optional(
    refine(IntFromString, (x) => {
      if (x < 1) {
        return 'must be greater than 0';
      }
    })
  ),
  order: optional(
    t.keyof({
      timestamp: null,
      '-timestamp': null,
    })
  ),
  group: optional(Slug),
  bucket: optional(Slug),
  provider: optional(Slug),
  from: optional(UnixTimeFromString),
  to: optional(UnixTimeFromString),
});

export type TRecordListOptions = t.TypeOf<typeof recordListOptions>;

export const recordList$ = (options: TRecordListOptions): Observable<IRecord[]> => {
  return recordRepository$.pipe(
    mergeMap((repo) => repo.find(createFindManyOptions(options))),
    map((records) => records.map(RecordEntityFromRecord.encode))
  );
};

export const recordCount$ = (options: TRecordListOptions): Observable<number> => {
  return recordRepository$.pipe(mergeMap((repo) => repo.count(createFindManyOptions(options))));
};

export const recordListWithCount$ = (
  options: TRecordListOptions
): Observable<IResultsWithCount<IRecord>> => {
  return recordRepository$.pipe(
    mergeMap((repo) => repo.findAndCount(createFindManyOptions(options))),
    map(([results, count]) => ({ count, results: results.map(RecordEntityFromRecord.encode) }))
  );
};

const createFindManyOptions = ({
  page,
  limit,
  order,
  group,
  bucket,
  provider,
  from,
  to,
}: TRecordListOptions): FindManyOptions<RecordEntity> => {
  const take = isDefined(limit) ? limit : 100;
  const skip = isDefined(page) && page > 1 ? (page - 1) * take : 0;
  const options: FindManyOptions<RecordEntity> = {
    take,
    skip,
    order: {
      timestamp: (order ?? '-').includes('-') ? 'DESC' : 'ASC',
    },
    where: {},
  };
  if (isDefined(group)) {
    Object.assign(options.where, { group: Equal(group) });
  }
  if (isDefined(bucket)) {
    Object.assign(options.where, { bucket: Equal(bucket) });
  }
  if (isDefined(provider)) {
    Object.assign(options.where, { provider: Equal(provider) });
  }
  if (isDefined(from)) {
    Object.assign(options.where, { timestamp: MoreThanOrEqual(from) });
  }
  if (isDefined(to)) {
    Object.assign(options.where, {
      timestamp: isDefined(from) ? Between(from, to) : LessThanOrEqual(to),
    });
  }
  return options;
};
