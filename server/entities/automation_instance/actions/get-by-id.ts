import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import {
  AutomationInstanceEntityFromAutomationInstance,
  automationInstanceRepository$,
} from '../typeorm';
import { IAutomationInstance, TAutomationInstanceID } from '../types';

export const automationInstanceGetByID$ = (
  id: TAutomationInstanceID
): Observable<IAutomationInstance> =>
  automationInstanceRepository$.pipe(
    mergeMap((repo) => repo.findOneOrFail(id)),
    map(AutomationInstanceEntityFromAutomationInstance.encode)
  );
