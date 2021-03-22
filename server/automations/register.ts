import { t } from '@marblejs/middleware-io';
import { AutomationGooglePhotosFood } from './google-photos-food/AutomationGooglePhotosFood';
import { EAutomation } from './types';
import { isDefined } from '../common/type-guards';

export const automationsReg = {
  [EAutomation.AutomationGooglePhotosFood]: AutomationGooglePhotosFood,
};

export const AutomationsRegKeys = t.keyof(automationsReg);

export const getAutomation = (name: EAutomation) => {
  const AutomationOrUndefined = automationsReg[name];
  if (isDefined(AutomationOrUndefined)) {
    return AutomationOrUndefined;
  } else {
    throw new Error(`${name} doesn't exist`);
  }
};
