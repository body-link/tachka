import { mergeMap } from 'rxjs/operators';
import { RecordEntityFromRecord, recordRepository$ } from '../typeorm';
import { TRecordID } from '../types';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import { isArray } from '../../../common/type-guards';

export const recordGetByID$ = (recordID: TRecordID | NonEmptyArray<TRecordID>) =>
  recordRepository$.pipe(
    mergeMap((repo) =>
      isArray(recordID)
        ? repo.findByIds(recordID).then((records) => records.map(RecordEntityFromRecord.encode))
        : repo.findOneOrFail(recordID).then(RecordEntityFromRecord.encode)
    )
  );
