import { defer } from 'rxjs';
import { createConnection } from 'typeorm';
import { shareReplay } from 'rxjs/operators';
import { ENV, getMySQL } from '../env';
import { RecordEntity } from '../entities/record/typeorm';

export const connection$ = defer(() =>
  createConnection({
    type: 'mysql',
    logging: ['error', 'schema'],
    dateStrings: true,
    synchronize: ENV.isDev,
    entities: [RecordEntity],

    // MySQL
    url: getMySQL(),
    timezone: ENV.timezone,
  })
).pipe(shareReplay(1));
