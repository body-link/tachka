import 'reflect-metadata';
import nodeFetch from 'node-fetch';
import { createServer, httpListener } from '@marblejs/core';
import { logger$ } from '@marblejs/middleware-logger';
import { bodyParser$ } from '@marblejs/middleware-body';
import { api$ } from './api';
import { ENV } from './env';
import { isUndefined } from './common/type-guards';

declare module globalThis {
  let fetch: typeof nodeFetch;
}

if (isUndefined(globalThis.fetch)) {
  globalThis.fetch = nodeFetch;
}

const middlewares = [bodyParser$()];

if (ENV.isDev) {
  middlewares.push(logger$());
}

createServer({
  port: parseInt(ENV.port),
  listener: httpListener({
    middlewares,
    effects: [api$],
  }),
}).then((io) => io());
