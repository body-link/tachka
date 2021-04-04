import { map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { RecordEntityFromRecord, recordRepository$ } from '../typeorm';
import { IRecord, IRecordUpdate } from '../types';
import { recordGetByID$ } from './get-by-id';
import { convertRecordToRecordEntity } from './utils';

export const recordUpdate$ = (patchRecord: IRecordUpdate) =>
  recordGetByID$(patchRecord.id).pipe(
    withLatestFrom(recordRepository$),
    mergeMap(([prevRecord, repo]) => {
      const nextRecord = { ...prevRecord, ...patchRecord } as IRecord;
      return repo.save(convertRecordToRecordEntity(nextRecord, 0));
    }),
    map(RecordEntityFromRecord.encode)
  );
