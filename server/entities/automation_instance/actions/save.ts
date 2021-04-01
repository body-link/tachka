import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AutomationInstanceEntity, automationInstanceRepository$ } from '../typeorm';
import { IAutomationInstance } from '../types';
import { isDefined } from '../../../common/type-guards';
import { automationInstanceGetByID$ } from './get-by-id';

export const automationInstanceSave$ = (
  instance: Partial<IAutomationInstance>
): Observable<IAutomationInstance> =>
  automationInstanceRepository$.pipe(
    mergeMap((repo) => {
      const { options, ...rest } = instance;
      return repo
        .save(
          repo.merge(new AutomationInstanceEntity(), rest, {
            options: isDefined(options) ? JSON.stringify(options) : undefined,
          })
        )
        .then((i) => i.id);
    }),
    mergeMap(automationInstanceGetByID$)
  );
