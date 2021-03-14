import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
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

export default options;
