import { r, use } from '@marblejs/core';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { isDefined } from '../../../common/type-guards';
import { Between, Equal, FindManyOptions, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { toBody } from '../../../common/utils';
import { requestValidator$, t } from '@marblejs/middleware-io';
import { IntFromString } from 'io-ts-types';
import { recordRepository$ } from './utils';
import { UnixTimeFromString } from '../../../common/io/UnixTime';
import { optional, refine } from '../../../common/io/utils';
import { Slug } from '../../../common/io/Slug';
import { RecordEntity, RecordEntityFromRecord } from '../../../entities/record/typeorm';

const validator$ = requestValidator$({
  query: t.type({
    page: optional(
      refine(IntFromString, (x) => {
        if (x <= 0) {
          return 'must be greater than 1 or equal to 1';
        }
      })
    ),
    limit: optional(
      refine(IntFromString, (x) => {
        if (x < 2) {
          return 'must be greater than 1';
        }
      })
    ),
    order: optional(
      t.keyof({
        timestamp: null,
        '-timestamp': null,
      })
    ),
    bucket: optional(Slug),
    provider: optional(Slug),
    from: optional(UnixTimeFromString),
    to: optional(UnixTimeFromString),
  }),
});

export const recordList$ = r.pipe(
  r.matchPath('/list'),
  r.matchType('GET'),
  r.useEffect((req$) =>
    req$.pipe(
      use(validator$),
      mergeMap(({ query }) => {
        const { page, limit, order, bucket, provider, from, to } = query;
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
        return recordRepository$.pipe(switchMap((repo) => repo.find(options)));
      }),
      map((records) => records.map(RecordEntityFromRecord.encode)),
      toBody
    )
  )
);
