import { combineRoutes } from '@marblejs/core';
import {
  recordCountEffect$,
  recordListEffect$,
  recordListWithCountEffect$,
} from './external/record/list.effect';
import { recordValidateEffect$ } from './external/record/validate.effect';
import { recordCreateEffect$ } from './external/record/create.effect';
import { recordGetByIDEffect$ } from './external/record/get-by-id.effect';
import { recordUpdateEffect$ } from './external/record/update.effect';
import { recordRemoveByIDEffect$ } from './external/record/remove-by-id.effect';
import { loginEffect$, logoutEffect$ } from './internal/auth.effects';
import { googleOAuth2CallbackEffect$ } from './custom/googleOAuth2Callback.effect';
import {
  integrationDataListEffect$,
  integrationDataRemoveEffect$,
  integrationDataSetEffect$,
} from './internal/integration/data.effects';
import { automationDefinitionsEffect$ } from './internal/automation/definitions.effect';
import {
  automationInstanceListEffect$,
  automationInstanceCreateEffect$,
  automationInstanceRemoveEffect$,
  automationInstanceStartEffect$,
  automationInstanceStatusEffect$,
  automationInstanceUpdateEffect$,
} from './internal/automation/instance.effects';
import { authorizeAny$, authorizeClient$ } from '../entities/token/middlewares';

export const api$ = combineRoutes('/', [
  combineRoutes('/', [
    loginEffect$,
    logoutEffect$,
    combineRoutes('/integration', {
      effects: [
        combineRoutes('/data', [
          integrationDataListEffect$,
          integrationDataSetEffect$,
          integrationDataRemoveEffect$,
        ]),
      ],
      middlewares: [authorizeClient$],
    }),
    combineRoutes('/automation', {
      effects: [
        automationDefinitionsEffect$,
        combineRoutes('/instance', [
          automationInstanceListEffect$,
          automationInstanceCreateEffect$,
          automationInstanceUpdateEffect$,
          automationInstanceRemoveEffect$,
          automationInstanceStatusEffect$,
          automationInstanceStartEffect$,
        ]),
      ],
      middlewares: [authorizeClient$],
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
        recordValidateEffect$,
        recordCreateEffect$,
        recordUpdateEffect$,
        recordRemoveByIDEffect$,
      ]),
    ],
    middlewares: [authorizeAny$],
  }),
]);
