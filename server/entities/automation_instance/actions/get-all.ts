import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import {
  AutomationInstanceEntityFromAutomationInstance,
  automationInstanceRepository$,
} from '../typeorm';
import { IAutomationInstance } from '../types';

export const automationInstanceGetAll$ = (): Observable<IAutomationInstance[]> =>
  automationInstanceRepository$.pipe(
    mergeMap((repo) => repo.find()),
    map((records) => records.map(AutomationInstanceEntityFromAutomationInstance.encode))
  );
