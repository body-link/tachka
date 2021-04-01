import * as cron from 'node-cron';
import { of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { TAutomationInstanceID } from './types';
import { Automation } from './common/Automation';
import { isDefined, isError, isNotNull } from '../common/type-guards';
import {
  IAutomationInstance,
  IAutomationInstanceCreate,
  IAutomationInstanceUpdate,
} from '../entities/automation_instance/types';
import { automationInstanceGetAll$ } from '../entities/automation_instance/actions/get-all';
import { automationInstanceSave$ } from '../entities/automation_instance/actions/save';
import { getAutomation, getAutomationSchemaOptions } from './register';
import { TOption } from '../common/type-utils';

const automations = new Map<TAutomationInstanceID, Automation>();
const automationItems = new Map<TAutomationInstanceID, IAutomationInstance>();
const automationTasks = new Map<TAutomationInstanceID, cron.ScheduledTask>();

automationInstanceGetAll$().subscribe((items) => items.forEach(init));

export const runAutomationInstance = (id: TAutomationInstanceID) => {
  const automation = automations.get(id);
  if (isDefined(automation)) {
    automation.start();
  } else {
    throw new Error(`Automation doesn't exist or turned off`);
  }
};

export const getAutomationInstanceStatus$ = () =>
  automationInstanceGetAll$().pipe(
    map((items) => {
      const extension = Array.from(automations.entries()).reduce<
        Record<number, { status: string; error: TOption<string> }>
      >((acc, [id, automation]) => {
        const state = automation.state$.getValue();
        acc[id] = {
          status: isError(state) ? 'crashed' : state ? 'working' : 'stopped',
          error: isError(state) ? state.message : undefined,
        };
        return acc;
      }, {});
      return items.map((item) => ({ ...item, ...extension[item.id] }));
    })
  );

export const createAutomationInstance$ = (payload: IAutomationInstanceCreate) =>
  of(payload.automation).pipe(
    map(getAutomationSchemaOptions),
    mergeMap((schemaOptions) =>
      automationInstanceSave$({
        ...payload,
        options: schemaOptions.decode(payload.options),
      })
    ),
    tap(init)
  );

export const updateAutomationInstance$ = ({
  id,
  options: rawOptions,
  schedule,
  isOn,
}: IAutomationInstanceUpdate) =>
  of(automationItems.get(id)).pipe(
    map((prevItem) => {
      if (!isDefined(prevItem)) {
        throw new Error(`Automation ID ${id} wasn't found`);
      }
      const patchItem: Partial<IAutomationInstance> = { id };
      if (isDefined(schedule) && schedule !== prevItem.schedule) {
        patchItem.schedule = schedule;
      }
      if (isDefined(isOn) && isOn !== prevItem.isOn) {
        patchItem.isOn = isOn;
      }
      if (isDefined(rawOptions)) {
        patchItem.options = getAutomationSchemaOptions(prevItem.automation).decode(rawOptions);
      }
      return patchItem;
    }),
    mergeMap((patchItem) =>
      automationInstanceSave$(patchItem).pipe(
        tap((nextItem) => {
          automationItems.set(id, nextItem);
          if (isDefined(patchItem.isOn)) {
            terminateInstance(id);
            terminateTask(id);
            initInstance(id);
            initTask(id);
          } else {
            if (isDefined(patchItem.options)) {
              terminateInstance(id);
              initInstance(id);
            }
            if (isDefined(patchItem.schedule)) {
              terminateTask(id);
              initTask(id);
            }
          }
        })
      )
    )
  );

const init = (item: IAutomationInstance) => {
  const id = item.id;
  automationItems.set(id, item);
  initInstance(id);
  initTask(id);
};

const initInstance = (id: TAutomationInstanceID) => {
  const item = automationItems.get(id);
  if (isDefined(item) && item.isOn) {
    const AutomationLike = getAutomation(item.automation);
    const automation = new AutomationLike(item.options);
    automations.set(id, automation);
  }
};

const terminateInstance = (id: TAutomationInstanceID) => {
  const automation = automations.get(id);
  if (isDefined(automation)) {
    automation.forceStop();
    automations.delete(id);
  }
};

const initTask = (id: TAutomationInstanceID) => {
  const item = automationItems.get(id);
  const automation = automations.get(id);
  if (isDefined(item) && isDefined(automation)) {
    const schedule = item.schedule;
    if (isNotNull(schedule) && item.isOn) {
      if (schedule === 'ASAP') {
        automation.start();
      } else {
        const task = cron.schedule(schedule, () => {
          automation.forceStop();
          automation.start();
        });
        automationTasks.set(id, task);
      }
    }
  }
};

const terminateTask = (id: TAutomationInstanceID) => {
  const task = automationTasks.get(id);
  if (isDefined(task)) {
    task.destroy();
    automationTasks.delete(id);
  }
};
