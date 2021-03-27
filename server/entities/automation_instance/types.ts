import { t } from '@marblejs/middleware-io';
import { Json } from 'io-ts-types';
import { PositiveInt } from '../../common/io/Positive';
import { AutomationsRegKeys } from '../../automations/register';
import { Cron } from '../../common/io/Cron';
import { optional } from '../../common/io/utils';

export const AutomationInstanceSchedule = t.union([t.null, Cron, t.literal('ASAP')]);
export type IAutomationInstanceSchedule = t.TypeOf<typeof AutomationInstanceSchedule>;

export const AutomationInstanceCreate = t.type(
  {
    automation: AutomationsRegKeys,
    options: Json,
    schedule: AutomationInstanceSchedule,
    isOn: t.boolean,
  },
  'AutomationInstanceCreate'
);
export type IAutomationInstanceCreate = t.TypeOf<typeof AutomationInstanceCreate>;

export const AutomationInstance = t.intersection(
  [
    t.type({
      id: PositiveInt,
    }),
    AutomationInstanceCreate,
  ],
  'AutomationInstance'
);
export type IAutomationInstance = t.TypeOf<typeof AutomationInstance>;
export type IAutomationInstanceWithOptions<T> = { options: T } & IAutomationInstance;

export const AutomationInstanceUpdate = t.type(
  {
    id: PositiveInt,
    options: optional(Json),
    schedule: optional(AutomationInstanceSchedule),
    isOn: optional(t.boolean),
  },
  'AutomationInstanceUpdate'
);
export type IAutomationInstanceUpdate = t.TypeOf<typeof AutomationInstanceUpdate>;
