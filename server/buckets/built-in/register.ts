import { ISlug } from '../../common/io/Slug';
import { Schema } from '../../schemas/Schema';
import { TOption } from '../../common/type-utils';
import { ISchemaCommonImage, ISchemaSleepEpisode } from '../../schemas/types';

// WARNING!
// Each value must be compatible with ISlug type
export enum EBuiltInBucket {
  FoodPhoto = 'food-photo',
  SleepEpisode = 'sleep-episode',
  Tag = 'tag',
  Note = 'note',
  Label = 'label',
}

export const regBuiltInBucket = ({
  [EBuiltInBucket.FoodPhoto]: new Schema<ISchemaCommonImage>(
    'FoodPhoto',
    'https://schemas.body.link/tachka/buckets/food-photo.json'
  ),
  [EBuiltInBucket.SleepEpisode]: new Schema<ISchemaSleepEpisode>(
    'SleepEpisode',
    'https://schemas.body.link/tachka/buckets/sleep-episode.json'
  ),
  [EBuiltInBucket.Tag]: new Schema<string>(
    'Tag',
    'https://schemas.body.link/tachka/buckets/tag.json'
  ),
  [EBuiltInBucket.Note]: new Schema<string>(
    'Note',
    'https://schemas.body.link/tachka/buckets/note.json'
  ),
  [EBuiltInBucket.Label]: new Schema<{ label: string; value: unknown }>(
    'Label',
    'https://schemas.body.link/tachka/buckets/label.json'
  ),
} as unknown) as Record<EBuiltInBucket, TOption<Schema>>;

export const getBuiltInBucket = (bucket: ISlug | EBuiltInBucket) =>
  regBuiltInBucket[bucket as EBuiltInBucket];
