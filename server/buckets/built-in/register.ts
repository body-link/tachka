import { schemaImage } from '../../schemas/schema-image';
import { ISlug } from '../../common/io/Slug';
import { Schema } from '../../schemas/Schema';
import { TOption } from '../../common/type-utils';

// WARNING!
// Each value must be compatible with ISlug type
export enum EBuiltInBucket {
  PhotosFood = 'photos-food',
}

export const regBuiltInBucket = ({
  [EBuiltInBucket.PhotosFood]: schemaImage,
} as unknown) as Record<EBuiltInBucket, TOption<Schema>>;

export const getBuiltInBucket = (bucket: ISlug | EBuiltInBucket) =>
  regBuiltInBucket[bucket as EBuiltInBucket];
