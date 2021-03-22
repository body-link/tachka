import { r } from '@marblejs/core';
import { map, mergeMap } from 'rxjs/operators';
import { toBody } from '../../../common/utils';
import { requestValidator$, t } from '@marblejs/middleware-io';
import {
  createAutomationInstance$,
  getAutomationInstanceStatus,
  runAutomationInstance,
} from '../../../automations/manager';
import { PositiveInt } from '../../../common/io/Positive';
import { AutomationInstanceCreate } from '../../../entities/automation_instance/types';

export const managerStatusEffect$ = r.pipe(
  r.matchPath('/status'),
  r.matchType('GET'),
  r.useEffect((req$) => req$.pipe(map(getAutomationInstanceStatus), toBody))
);

const validateRequestStart = requestValidator$({
  body: t.type({
    id: PositiveInt,
  }),
});

export const managerStartEffect$ = r.pipe(
  r.matchPath('/start'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRequestStart,
      map((req) => runAutomationInstance(req.body.id)),
      toBody
    )
  )
);

const validateRequestCreate = requestValidator$({
  body: AutomationInstanceCreate,
});

export const managerCreateEffect$ = r.pipe(
  r.matchPath('/create'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRequestCreate,
      mergeMap((req) => createAutomationInstance$(req.body)),
      toBody
    )
  )
);
