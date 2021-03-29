import { createConnection } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { defer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ENV, getEnvMySQL_URL } from './env';

const options: MysqlConnectionOptions = {
  type: 'mysql',
  url: getEnvMySQL_URL(),
  dateStrings: true,
  timezone: ENV.timezone,
  migrationsRun: ENV.isProd,
  migrationsTableName: 'sys_migration',

  logging: ['error', 'schema'],
  entities: ['server/entities/**/typeorm.ts'],
  migrations: ['server/migrations/*.ts'],
  cli: {
    migrationsDir: 'server/migrations',
  },
};

// Needs to be here for TypeORM CLI tools
export default options;

export const connection$ = defer(() => createConnection(options)).pipe(shareReplay(1));
