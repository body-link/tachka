import { t } from '@marblejs/middleware-io';
import { mergeMap } from 'rxjs/operators';
import { nonEmptyArray } from 'io-ts-types';
import { connection$ } from '../../../common/db';
import { RecordEntity, RecordEntityFromRecord } from '../typeorm';
import { Record } from '../types';
import { decodeWith } from '../../../common/io/utils';
import { getBuiltInBucket } from '../../../buckets/manager';
import { isDefined, isError } from '../../../common/type-guards';
import dedent from 'ts-dedent';

export const recordCreateOptions = nonEmptyArray(Record);

export const recordCreate$ = (options: t.TypeOf<typeof recordCreateOptions>) =>
  connection$.pipe(
    mergeMap((connection) => {
      const records = options.map((record, index) => {
        try {
          const builtInBucket = getBuiltInBucket(record.bucket);
          if (isDefined(builtInBucket)) {
            record.data = builtInBucket.decode(record.data);
          }
          return decodeRecordEntityFromRecord(record);
        } catch (error) {
          const msg = isError(error) ? error.message : '';
          throw new Error(dedent`
            Record ID ${record.id} with index ${index} is invalid
            Reason: ${msg}
          `);
        }
      });
      // TODO: since this is a stream, we need to think about how to rollback changes
      // in case the stream was unsubscribed before finish operation
      return connection
        .createQueryBuilder()
        .insert()
        .into(RecordEntity)
        .values(records)
        .execute()
        .then(() => records.map(RecordEntityFromRecord.encode));
    })
  );

const decodeRecordEntityFromRecord = decodeWith(RecordEntityFromRecord);
