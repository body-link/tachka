import { Schema } from '../../schemas/Schema';
import { ISlug } from '../../common/io/Slug';

export interface ISchemaAutomationGooglePhotosFoodOptions {
  profile: string;
  recordGroup: ISlug;
  initialFromDate: Date;
}

export const schemaGooglePhotosFoodOptions = new Schema<ISchemaAutomationGooglePhotosFoodOptions>(
  'AutomationGooglePhotosFoodOptions',
  {
    definitions: {},
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://example.com/object1617247488.json',
    title: 'Root',
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
        title: 'Recordgroup',
        type: 'string',
        default: '',
        pattern: '^.*$',
      },
      initialFromDate: {
        $id: '#root/initialFromDate',
        title: 'Initialfromdate',
        type: 'string',
        format: 'date-time',
      },
    },
  }
);
