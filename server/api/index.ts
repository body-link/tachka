import { combineRoutes } from '@marblejs/core';
import { authorize$ } from './middlewares';
import {
  recordCountEffect$,
  recordListEffect$,
  recordListWithCountEffect$,
} from './external/record/list.effect';
import { recordCreateEffect$ } from './external/record/create.effect';
import { loginEffect$, logoutEffect$ } from './internal/auth.effects';
import { googleOAuth2CallbackEffect$ } from './custom/googleOAuth2Callback.effect';
import { integrationDataSetEffect$ } from './internal/integration/data.effects';
import {
  managerCreateEffect$,
  managerStartEffect$,
  managerStatusEffect$,
  managerUpdateEffect$,
} from './internal/automation/manager.effects';
import { recordGetByIDEffect$ } from './external/record/get-by-id.effect';
import { recordUpdateEffect$ } from './external/record/update.effect';
import { recordRemoveByIDEffect$ } from './external/record/remove-by-id.effect';

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
    effects: [
      combineRoutes('/record', [
        recordGetByIDEffect$,
        recordListEffect$,
        recordCountEffect$,
        recordListWithCountEffect$,
        recordCreateEffect$,
        recordUpdateEffect$,
        recordRemoveByIDEffect$,
      ]),
    ],
    middlewares: [authorize$],
  }),
]);
