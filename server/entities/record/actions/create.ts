import { t } from '@marblejs/middleware-io';
import { switchMap } from 'rxjs/operators';
import { nonEmptyArray } from 'io-ts-types';
import * as O from 'fp-ts/Option';
import { connection$ } from '../../../common/db';
import { RecordEntity, RecordEntityFromRecord } from '../typeorm';
import { isDefined } from '../../../common/type-guards';
import { Record } from '../types';

export const recordCreateOptions = nonEmptyArray(Record);

export const recordCreate$ = (options: t.TypeOf<typeof recordCreateOptions>) =>
  connection$.pipe(
    switchMap((connection) => {
      const records = options
        .map(RecordEntityFromRecord.decode)
        .map(O.getRight)
        .map(O.toUndefined)
        .filter(isDefined);
      return connection
        .createQueryBuilder()
        .insert()
        .into(RecordEntity)
        .values(records)
        .execute()
        .then(() => records.map(RecordEntityFromRecord.encode));
    })
  );
