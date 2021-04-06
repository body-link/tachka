import { map, mergeMap } from 'rxjs/operators';
import { recordRepository$ } from '../typeorm';
import { TRecordID } from '../types';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import { toAffected } from '../../../common/utils';

export const recordRemoveByID$ = (recordID: TRecordID | NonEmptyArray<TRecordID>) =>
  recordRepository$.pipe(
    mergeMap((repo) => repo.delete(recordID)),
    map(toAffected)
  );
