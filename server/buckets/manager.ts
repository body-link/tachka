import { bucketImage } from './build-in/image';
import { ISlug } from '../common/io/Slug';
import { Bucket } from './common/Bucket';
import { TOption } from '../common/type-utils';

export const bucketsReg = {
  'photos-food': bucketImage,
};

export const getBuiltInBucket = (bucket: ISlug) =>
  ((bucketsReg as unknown) as Record<string, TOption<Bucket>>)[bucket];
