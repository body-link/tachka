import { r } from '@marblejs/core';
import { map, mergeMap } from 'rxjs/operators';
import { toBody } from '../../../common/utils';
import { requestValidator$, t } from '@marblejs/middleware-io';
import {
  createAutomationInstance$,
  getAutomationExemplarStatus,
  removeAutomationInstance$,
  startAutomationExemplar,
  updateAutomationInstance$,
} from '../../../automations/manager';
import { PositiveInt } from '../../../common/io/Positive';
import {
  AutomationInstanceCreate,
  AutomationInstanceUpdate,
} from '../../../entities/automation_instance/types';
import { automationInstanceGetAll$ } from '../../../entities/automation_instance/actions/get-all';
import { NumberFromString } from 'io-ts-types';

export const automationInstanceListEffect$ = r.pipe(
  r.matchPath('/list'),
  r.matchType('GET'),
  r.useEffect((req$) => req$.pipe(mergeMap(automationInstanceGetAll$), toBody))
);

const validateRequestCreate = requestValidator$({
  body: AutomationInstanceCreate,
});

export const automationInstanceCreateEffect$ = r.pipe(
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

const validateRequestUpdate = requestValidator$({
  body: AutomationInstanceUpdate,
});

export const automationInstanceUpdateEffect$ = r.pipe(
  r.matchPath('/update'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRequestUpdate,
      mergeMap((req) => updateAutomationInstance$(req.body)),
      toBody
    )
  )
);

const validateRemoveByIDRequest = requestValidator$({
  body: PositiveInt,
});

export const automationInstanceRemoveEffect$ = r.pipe(
  r.matchPath('/remove'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRemoveByIDRequest,
      mergeMap((req) => removeAutomationInstance$(req.body)),
      toBody
    )
  )
);

const validateRequestIDinParams = requestValidator$({
  params: t.type({
    id: NumberFromString.pipe(PositiveInt),
  }),
});

export const automationInstanceStatusEffect$ = r.pipe(
  r.matchPath('/status/:id'),
  r.matchType('GET'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRequestIDinParams,
      map((req) => getAutomationExemplarStatus(req.params.id)),
      toBody
    )
  )
);

export const automationInstanceStartEffect$ = r.pipe(
  r.matchPath('/start/:id'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRequestIDinParams,
      map((req) => startAutomationExemplar(req.params.id)),
      toBody
    )
  )
);
