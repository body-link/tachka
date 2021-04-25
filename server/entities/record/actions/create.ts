import { nanoid } from 'nanoid';
import { mergeMap } from 'rxjs/operators';
import { nonEmptyArray } from 'io-ts-types';
import { RecordEntity } from '../typeorm';
import { IRecordCreate, RecordCreate, TRecordID } from '../types';
import { connection$ } from '../../../config/typeorm';
import { convertRecordToRecordEntity } from './utils';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';

export const recordCreateOptions = nonEmptyArray(RecordCreate);

export const recordCreate$ = (records: NonEmptyArray<IRecordCreate>, orIgnore = false) =>
  connection$.pipe(
    mergeMap((connection) => {
      const recordEntities = records
        .map(({ id, ...rest }) => ({ id: id ?? (nanoid() as TRecordID), ...rest }))
        .map(convertRecordToRecordEntity);
      // TODO: since this is a stream, we need to think about how to rollback changes
      // in case the stream was unsubscribed before finish operation
      return connection
        .createQueryBuilder()
        .insert()
        .into(RecordEntity)
        .values(recordEntities)
        .orIgnore(orIgnore)
        .execute()
        .then(({ identifiers, raw: { affectedRows } }) => ({
          created: affectedRows as number,
          ignored: identifiers.length - affectedRows,
        }));
    })
  );
