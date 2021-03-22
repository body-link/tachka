import { Bucket } from '../common/Bucket';

export interface IBucketImage {
  id: string;
  url: string;
  width: number;
  height: number;
  source?: string;
}

export const bucketImage = new Bucket<IBucketImage>('image', {
  definitions: {},
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://example.com/object1616472389.json',
  title: 'Root',
  type: 'object',
  required: ['id', 'url', 'width', 'height'],
  properties: {
    id: {
      $id: '#root/id',
      title: 'Id',
      type: 'string',
      default: '',
      pattern: '^.*$',
    },
    url: {
      $id: '#root/url',
      title: 'Url',
      type: 'string',
      default: '',
      pattern: '^.*$',
    },
    width: {
      $id: '#root/width',
      title: 'Width',
      type: 'integer',
      default: 0,
    },
    height: {
      $id: '#root/height',
      title: 'Height',
      type: 'integer',
      default: 0,
    },
    source: {
      $id: '#root/source',
      title: 'Source',
      type: 'string',
      default: '',
      pattern: '^.*$',
    },
  },
});
