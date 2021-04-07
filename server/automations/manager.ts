import * as cron from 'node-cron';
import { of, throwError } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Automation } from './common/Automation';
import { isDefined, isError, isNotNull } from '../common/type-guards';
import {
  IAutomationInstance,
  IAutomationInstanceCreate,
  IAutomationInstanceUpdate,
  TAutomationInstanceID,
} from '../entities/automation_instance/types';
import { automationInstanceGetAll$ } from '../entities/automation_instance/actions/get-all';
import { automationInstanceSave$ } from '../entities/automation_instance/actions/save';
import { getAutomationDefinition } from './register';
import { automationRemoveByID$ } from '../entities/automation_instance/actions/remove-by-id';

// The role of the manager is to efficiently manage memory based on automation instance settings

// This's automation instance settings map which is always sync with DB values
const automationInstances = new Map<TAutomationInstanceID, IAutomationInstance>();

// The value exists only when setting isOn is true
const automationExemplars = new Map<TAutomationInstanceID, Automation>();

// The value exists only when setting cron is Cron io-type
const automationCronTasks = new Map<TAutomationInstanceID, cron.ScheduledTask>();

automationInstanceGetAll$().subscribe((items) => items.forEach(init));

export const startAutomationExemplar = (id: TAutomationInstanceID) =>
  getAutomationExemplar(id).start();

export const getAutomationExemplarStatus = (id: TAutomationInstanceID) => {
  const state = getAutomationExemplar(id).state$.getValue();
  return {
    status: isError(state) ? 'crashed' : state ? 'working' : 'stopped',
    error: isError(state) ? state.message : undefined,
  };
};

export const createAutomationInstance$ = (payload: IAutomationInstanceCreate) =>
  of(payload.automation).pipe(
    map(getAutomationDefinition),
    mergeMap(({ schemaOptions }) =>
      automationInstanceSave$({
        ...payload,
        options: schemaOptions.decode(payload.options),
      })
    ),
    tap(init)
  );

export const updateAutomationInstance$ = ({
  id,
  name,
  options: rawOptions,
  schedule,
  isOn,
}: IAutomationInstanceUpdate) =>
  of(automationInstances.get(id)).pipe(
    map((prevItem) => {
      if (!isDefined(prevItem)) {
        throw new Error(`Automation ID ${id} wasn't found`);
      }
      const patchItem: Partial<IAutomationInstance> = { id, name };
      if (isDefined(schedule) && schedule !== prevItem.schedule) {
        patchItem.schedule = schedule;
      }
      if (isDefined(isOn) && isOn !== prevItem.isOn) {
        patchItem.isOn = isOn;
      }
      if (isDefined(rawOptions)) {
        patchItem.options = getAutomationDefinition(prevItem.automation).schemaOptions.decode(
          rawOptions
        );
      }
      return patchItem;
    }),
    mergeMap((patchItem) =>
      automationInstanceSave$(patchItem).pipe(
        tap((nextItem) => {
          automationInstances.set(id, nextItem);
          if (isDefined(patchItem.isOn)) {
            terminateExemplar(id);
            terminateTask(id);
            initExemplar(id);
            initTask(id);
          } else {
            if (isDefined(patchItem.options)) {
              terminateExemplar(id);
              initExemplar(id);
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

export const removeAutomationInstance$ = (id: TAutomationInstanceID) =>
  automationInstances.has(id)
    ? automationRemoveByID$(id).pipe(
        tap(() => {
          automationInstances.delete(id);
          terminateExemplar(id);
          terminateTask(id);
        })
      )
    : throwError(new Error(`Automation ID ${id} doesn't exist`));

const init = (item: IAutomationInstance) => {
  const id = item.id;
  automationInstances.set(id, item);
  initExemplar(id);
  initTask(id);
};

const initExemplar = (id: TAutomationInstanceID) => {
  const item = automationInstances.get(id);
  if (isDefined(item) && item.isOn) {
    const AutomationLike = getAutomationDefinition(item.automation).class;
    const exemplar = new AutomationLike(item.options);
    automationExemplars.set(id, exemplar);
  }
};

const terminateExemplar = (id: TAutomationInstanceID) => {
  const exemplar = automationExemplars.get(id);
  if (isDefined(exemplar)) {
    exemplar.forceStop();
    automationExemplars.delete(id);
  }
};

const initTask = (id: TAutomationInstanceID) => {
  const item = automationInstances.get(id);
  const exemplar = automationExemplars.get(id);
  if (isDefined(item) && isDefined(exemplar)) {
    const schedule = item.schedule;
    if (isNotNull(schedule) && item.isOn) {
      if (schedule === 'ASAP') {
        exemplar.start();
      } else {
        const task = cron.schedule(schedule, () => {
          exemplar.forceStop();
          exemplar.start();
        });
        automationCronTasks.set(id, task);
      }
    }
  }
};

const terminateTask = (id: TAutomationInstanceID) => {
  const task = automationCronTasks.get(id);
  if (isDefined(task)) {
    task.destroy();
    automationCronTasks.delete(id);
  }
};

const getAutomationExemplar = (id: TAutomationInstanceID) => {
  const exemplar = automationExemplars.get(id);
  if (isDefined(exemplar)) {
    return exemplar;
  } else {
    throw new Error(`Automation ID ${id} doesn't exist or turned off`);
  }
};
