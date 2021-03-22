import { Observable } from 'rxjs';
import { IAutomationInstance, IAutomationInstanceCreate } from '../types';
import { automationInstanceSave$ } from './save';

export const automationInstanceCreate$ = (
  instance: IAutomationInstanceCreate
): Observable<IAutomationInstance> => automationInstanceSave$(instance);
