import { t } from '@marblejs/middleware-io';
import { AutomationGooglePhotosFood } from './google-photos-food/AutomationGooglePhotosFood';
import { isDefined } from '../common/type-guards';
import { schemaGooglePhotosFoodOptions } from './google-photos-food/schema-options';
import { Schema } from '../schemas/Schema';
import { TAutomationLike } from './common/Automation';
import { EBuiltInBucket } from '../buckets/built-in/register';

// WARNING!
// Each value must be compatible with ISlug type
export enum EAutomation {
  GooglePhotosFood = 'automation-google-photos-food',
}

const reg: Record<EAutomation, Omit<IAutomationDefinition, 'automation'>> = {
  [EAutomation.GooglePhotosFood]: {
    name: 'Google Photos Food',
    description: `Parse Google Photos with food label to ${EBuiltInBucket.PhotosFood} bucket`,
    recipe: '#TODO\nWrite recipe',
    class: AutomationGooglePhotosFood,
    schemaOptions: schemaGooglePhotosFoodOptions,
  },
};

export const AutomationsRegKeys = t.keyof(reg);

export const getAutomationDefinition = (automation: EAutomation) => {
  const definition = allAutomationDefinitions[automation];
  if (isDefined(definition)) {
    return definition;
  } else {
    throw new Error(`Automation definition ${automation} doesn't exist`);
  }
};

export const allAutomationDefinitions = Object.entries(reg).reduce((acc, [key, definition]) => {
  const automation = key as EAutomation;
  acc[automation] = { automation, ...definition };
  return acc;
}, {} as Record<EAutomation, IAutomationDefinition>);

export interface IAutomationDefinition {
  automation: EAutomation;
  name: string;
  description: string;
  recipe: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class: TAutomationLike<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemaOptions: Schema<any>;
}
