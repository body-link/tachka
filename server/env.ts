import * as dotenv from 'dotenv';
import { isDefined } from './common/type-guards';

dotenv.config({ path: `${__dirname}/.env` });

const env = process.env.NODE_ENV;
const isProd = env === 'production';
const isDev = !isProd;
const url = process.env.APP_URL;
const port = process.env.PORT ?? '8080';
const timezone = (process.env.TZ = 'Z');

export const ENV = {
  env,
  isDev,
  isProd,
  url,
  port,
  timezone,
};

export const getEnvSecret = (): string => {
  const secret = process.env.SECRET;
  if (!isDefined(secret) || (isProd && secret === SECRET_FROM_DOTENV)) {
    throw Error('Please set your SECRET environment variable');
  }
  if (secret.length < 48) {
    throw Error('Please make your secret longer, it should be at least 48 symbols long');
  }
  return secret;
};

export const getEnvMySQL_URL = (): string => {
  const url = process.env.MYSQL_URL;
  if (!isDefined(url)) {
    throw Error('Please set MYSQL_URL environment variable');
  }
  return url;
};

const SECRET_FROM_DOTENV =
  "This secret from .env file won't work on production. Change it after deploy";
