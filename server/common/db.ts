import { defer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { createConnection } from 'typeorm';
import options from '../ormconfig';
import { RecordEntity } from '../entities/record/typeorm';
import { IntegrationAuthEntity } from '../entities/integration_auth/typeorm';
import { IntegrationDataEntity } from '../entities/integration_data/typeorm';

export const connection$ = defer(() => createConnection(options)).pipe(shareReplay(1));

export const recordRepository$ = connection$.pipe(
  map((connection) => connection.getRepository(RecordEntity))
);

export const integrationDataRepository$ = connection$.pipe(
  map((connection) => connection.getRepository(IntegrationDataEntity))
);

export const integrationAuthRepository$ = connection$.pipe(
  map((connection) => connection.getRepository(IntegrationAuthEntity))
);
