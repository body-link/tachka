import { mergeMap } from 'rxjs/operators';
import { nonEmptyArray } from 'io-ts-types';
import { RecordEntity, RecordEntityFromRecord } from '../typeorm';
import { IRecord, Record } from '../types';
import { connection$ } from '../../../config/typeorm';
import { convertRecordToRecordEntity } from './utils';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';

export const recordCreateOptions = nonEmptyArray(Record);

export const recordCreate$ = (records: NonEmptyArray<IRecord>) =>
  connection$.pipe(
    mergeMap((connection) => {
      const recordEntities = records.map(convertRecordToRecordEntity);
      // TODO: since this is a stream, we need to think about how to rollback changes
      // in case the stream was unsubscribed before finish operation
      return connection
        .createQueryBuilder()
        .insert()
        .into(RecordEntity)
        .values(recordEntities)
        .execute()
        .then(() => recordEntities.map(RecordEntityFromRecord.encode));
    })
  );
