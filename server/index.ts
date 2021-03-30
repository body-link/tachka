import 'reflect-metadata';
import { readFileSync } from 'fs';
import nodeFetch from 'node-fetch';
import { createServer, httpListener, ServerOptions } from '@marblejs/core';
import { logger$ } from '@marblejs/middleware-logger';
import { cors$ } from '@marblejs/middleware-cors';
import { bodyParser$ } from '@marblejs/middleware-body';
import { api$ } from './api';
import { ENV } from './config/env';
import { isUndefined } from './common/type-guards';

declare module globalThis {
  let fetch: typeof nodeFetch;
}

if (isUndefined(globalThis.fetch)) {
  globalThis.fetch = nodeFetch;
}

const serverOptions: ServerOptions = {};
const middlewares = [
  cors$({
    origin: '*',
    methods: ['GET', 'POST'],
    allowHeaders: ['Origin', 'Authorization', 'Content-Type'],
    withCredentials: true,
    maxAge: 60 * 60 * 24, // 1 day
  }),
  bodyParser$(),
];

if (ENV.isDev) {
  serverOptions.httpsOptions = {
    cert: readFileSync(`${__dirname}/config/dev-only.cert.pem`),
    key: readFileSync(`${__dirname}/config/dev-only.key.pem`),
  };
  middlewares.push(logger$());
}

createServer({
  options: serverOptions,
  port: parseInt(ENV.port),
  listener: httpListener({
    middlewares,
    effects: [api$],
  }),
}).then((io) => io());
