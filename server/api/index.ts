import { combineRoutes } from '@marblejs/core';
import { authorize$ } from './middlewares';
import { recordListEffect$ } from './external/record/list.effect';
import { recordCreateEffect$ } from './external/record/create.effect';
import { loginEffect$, logoutEffect$ } from './internal/auth.effects';
import { googleOAuth2CallbackEffect$ } from './custom/googleOAuth2Callback.effect';
import { integrationDataSetEffect$ } from './internal/integration/data.effects';
import {
  managerStatusEffect$,
  managerCreateEffect$,
  managerStartEffect$,
  managerUpdateEffect$,
} from './internal/automation/manager.effects';

export const api$ = combineRoutes('/', [
  combineRoutes('/', [
    loginEffect$,
    logoutEffect$,
    combineRoutes('/integration', {
      effects: [combineRoutes('/data', [integrationDataSetEffect$])],
      middlewares: [authorize$],
    }),
    combineRoutes('/automation', {
      effects: [
        combineRoutes('/manager', [
          managerStatusEffect$,
          managerStartEffect$,
          managerCreateEffect$,
          managerUpdateEffect$,
        ]),
      ],
      middlewares: [authorize$],
    }),
    combineRoutes('/custom', [googleOAuth2CallbackEffect$]),
  ]),
  combineRoutes('/api/v1', {
    effects: [combineRoutes('/record', [recordListEffect$, recordCreateEffect$])],
    middlewares: [authorize$],
  }),
]);
