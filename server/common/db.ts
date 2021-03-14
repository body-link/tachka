import { defer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { createConnection } from 'typeorm';
import { RecordEntity } from '../entities/record/typeorm';
import options from '../ormconfig';

export const connection$ = defer(() => createConnection(options)).pipe(shareReplay(1));

export const recordRepository$ = connection$.pipe(
  map((connection) => connection.getRepository(RecordEntity))
);
