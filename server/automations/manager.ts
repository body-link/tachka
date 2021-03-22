import * as cron from 'node-cron';
import { tap } from 'rxjs/operators';
import { TAutomationInstanceID } from './types';
import { Automation } from './common/Automation';
import { isDefined, isError, isNotNull } from '../common/type-guards';
import {
  IAutomationInstance,
  IAutomationInstanceCreate,
  IAutomationInstanceUpdate,
} from '../entities/automation_instance/types';
import { automationInstanceGetAll$ } from '../entities/automation_instance/actions/get-all';
import { automationInstanceCreate$ } from '../entities/automation_instance/actions/create';
import { automationInstanceSave$ } from '../entities/automation_instance/actions/save';
import { getAutomation } from './register';

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

export const getAutomationInstanceStatus = () =>
  Array.from(automations.entries()).map(([id, automation]) => {
    const state = automation.state$.getValue();
    const status = isError(state) ? `Error:\n${state.message}` : state ? 'working' : 'stopped';
    return { id, name: automation.name, status };
  });

export const createAutomationInstance$ = (payload: IAutomationInstanceCreate) =>
  automationInstanceCreate$(payload).pipe(tap(init));

export const updateAutomationInstance$ = ({
  id,
  options,
  schedule,
  isOn,
}: IAutomationInstanceUpdate) => {
  const prevItem = automationItems.get(id);
  const patchItem: Partial<IAutomationInstance> = { id, options };
  if (isDefined(schedule) && schedule !== prevItem?.schedule) {
    patchItem.schedule = schedule;
  }
  if (isDefined(isOn) && isOn !== prevItem?.isOn) {
    patchItem.isOn = isOn;
  }
  return automationInstanceSave$(patchItem).pipe(
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
  );
};

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
    const automation = new AutomationLike(item.options as never);
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
