import { t } from '@marblejs/middleware-io';
import { AutomationGooglePhotosFood } from './google-photos-food/AutomationGooglePhotosFood';
import { isDefined } from '../common/type-guards';
import { schemaGooglePhotosFoodOptions } from './google-photos-food/schema-options';
import { Schema } from '../schemas/Schema';
import { TAutomationLike } from './common/Automation';

// WARNING!
// Each value must be compatible with ISlug type
export enum EAutomation {
  GooglePhotosFood = 'automation-google-photos-food',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const regAutomation: Record<EAutomation, TAutomationLike<any>> = {
  [EAutomation.GooglePhotosFood]: AutomationGooglePhotosFood,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const regAutomationSchemaOptions: Record<EAutomation, Schema<any>> = {
  [EAutomation.GooglePhotosFood]: schemaGooglePhotosFoodOptions,
};

export const AutomationsRegKeys = t.keyof(regAutomation);

export const getAutomation = (name: EAutomation) => {
  const AutomationOrUndefined = regAutomation[name];
  if (isDefined(AutomationOrUndefined)) {
    return AutomationOrUndefined;
  } else {
    throw new Error(`${name} doesn't exist`);
  }
};

export const getAutomationSchemaOptions = (name: EAutomation) => {
  const schemaOptions = regAutomationSchemaOptions[name];
  if (isDefined(schemaOptions)) {
    return schemaOptions;
  } else {
    throw new Error(`${name} doesn't exist`);
  }
};
