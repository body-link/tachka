import { t } from '@marblejs/middleware-io';
import { map, mergeMap } from 'rxjs/operators';
import { nonEmptyArray, NonEmptyString } from 'io-ts-types';
import { RecordEntityFromRecord, recordRepository$ } from '../typeorm';

export const recordGetByIDOptions = NonEmptyString;

export const recordGetByID$ = (options: t.TypeOf<typeof recordGetByIDOptions>) =>
  recordRepository$.pipe(
    mergeMap((repo) => repo.findOneOrFail(options)),
    map(RecordEntityFromRecord.encode)
  );

export const recordGetByIDsOptions = nonEmptyArray(NonEmptyString);

export const recordGetByIDs$ = (options: t.TypeOf<typeof recordGetByIDsOptions>) =>
  recordRepository$.pipe(
    mergeMap((repo) => repo.findByIds(options)),
    map((records) => records.map(RecordEntityFromRecord.encode))
  );
