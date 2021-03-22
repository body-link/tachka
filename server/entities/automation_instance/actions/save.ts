import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import {
  AutomationInstanceEntity,
  AutomationInstanceEntityFromAutomationInstance,
  automationInstanceRepository$,
} from '../typeorm';
import { IAutomationInstance } from '../types';
import { isDefined } from '../../../common/type-guards';

export const automationInstanceSave$ = (
  instance: Partial<IAutomationInstance>
): Observable<IAutomationInstance> =>
  automationInstanceRepository$.pipe(
    mergeMap((repo) => {
      const { options, ...rest } = instance;
      return repo.save(
        repo.merge(new AutomationInstanceEntity(), rest, {
          options: isDefined(options) ? JSON.stringify(options) : undefined,
        })
      );
    }),
    map(AutomationInstanceEntityFromAutomationInstance.encode)
  );
