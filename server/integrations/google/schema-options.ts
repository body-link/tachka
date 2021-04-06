import { Schema } from '../../schemas/Schema';

export interface ISchemaIntegrationGoogleOptions {
  clientID: string;
  clientSecret: string;
}

export const schemaIntegrationGoogleOptions = new Schema<ISchemaIntegrationGoogleOptions>(
  'IntegrationGoogleOptions',
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['clientID', 'clientSecret'],
    properties: {
      clientID: {
        $id: '#root/clientID',
        title: 'Client ID',
        type: 'string',
        default: '',
        pattern: '^.*$',
      },
      clientSecret: {
        $id: '#root/clientSecret',
        title: 'Client Secret',
        type: 'string',
        default: '',
        pattern: '^.*$',
      },
    },
  }
);
