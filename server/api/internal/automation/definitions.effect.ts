import { r } from '@marblejs/core';
import { pipe } from 'fp-ts/function';
import * as R from 'fp-ts/Record';
import { map } from 'rxjs/operators';
import { toBody } from '../../../common/utils';
import { allAutomationDefinitions } from '../../../automations/register';

export const automationDefinitionsEffect$ = r.pipe(
  r.matchPath('/definitions'),
  r.matchType('GET'),
  r.useEffect((req$) =>
    req$.pipe(
      map(() =>
        pipe(
          allAutomationDefinitions,
          R.map(({ automation, name, description, recipe, schemaOptions }) => ({
            automation,
            name,
            description,
            recipe,
            schemaOptions: schemaOptions.JSONSchema,
          }))
        )
      ),
      toBody
    )
  )
);
