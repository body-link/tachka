import { connection$ } from '../../../db/connection';
import { map } from 'rxjs/operators';
import { RecordEntity } from '../../../entities/record/typeorm';

export const recordRepository$ = connection$.pipe(
  map((connection) => connection.getRepository(RecordEntity))
);
