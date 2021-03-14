import { r, use } from '@marblejs/core';
import { mergeMap, switchMap } from 'rxjs/operators';
import { toBody } from '../../../common/utils';
import { requestValidator$ } from '@marblejs/middleware-io';
import { nonEmptyArray } from 'io-ts-types';
import { RecordEntity, RecordEntityFromRecord } from '../../../entities/record/typeorm';
import { Record } from '../../../entities/record/types';
import { getRight, toUndefined } from 'fp-ts/Option';
import { isDefined } from '../../../common/type-guards';
import { connection$ } from '../../../common/db';

const validator$ = requestValidator$({
  body: nonEmptyArray(Record),
});

export const recordCreate$ = r.pipe(
  r.matchPath('/create'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      use(validator$),
      mergeMap((req) =>
        connection$.pipe(
          switchMap((connection) => {
            const records = req.body
              .map(RecordEntityFromRecord.decode)
              .map(getRight)
              .map(toUndefined)
              .filter(isDefined);
            return connection
              .createQueryBuilder()
              .insert()
              .into(RecordEntity)
              .values(records)
              .execute()
              .then(() => records.map(RecordEntityFromRecord.encode));
          })
        )
      ),
      toBody
    )
  )
);
