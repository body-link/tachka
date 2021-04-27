import { Schema } from '../../schemas/Schema';
import { ISlug } from '../../common/io/Slug';

export interface ISchemaAutomationSleepAsAndroidOptions {
  profile: string;
  recordGroup: ISlug;
  initialFromDate: Date;
}

export const schemaAutomationSleepAsAndroidOptions = new Schema<ISchemaAutomationSleepAsAndroidOptions>(
  'AutomationSleepAsAndroidOptions',
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['profile', 'recordGroup', 'initialFromDate'],
    properties: {
      profile: {
        $id: '#root/profile',
        title: 'Profile',
        type: 'string',
        default: '',
        pattern: '^.*$',
      },
      recordGroup: {
        $id: '#root/recordGroup',
        title: 'Record group',
        type: 'string',
        default: '',
        pattern: '^.*$',
      },
      initialFromDate: {
        $id: '#root/initialFromDate',
        title: 'Initial from date',
        type: 'string',
        format: 'date-time',
      },
    },
  }
);
