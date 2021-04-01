import { of, using } from 'rxjs';
import { Automation } from './common/Automation';
import { EAutomation, getAutomation } from './register';

export const useAutomation$ = (name: EAutomation, options?: unknown) =>
  using(
    () => new (getAutomation(name))(options),
    (a) => of(a as Automation)
  );
