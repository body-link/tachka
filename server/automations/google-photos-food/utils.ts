import { ISchemaImage } from '../../schemas/schema-image';
import { IGoogleMediaItem } from '../../integrations/google/IntegrationGooglePhotos';

export const toData = (item: IGoogleMediaItem): ISchemaImage => {
  const size = {
    width: parseInt(item.mediaMetadata.width),
    height: parseInt(item.mediaMetadata.height),
  };
  const d = size.width > size.height ? 'width' : 'height';
  const m = size.width <= size.height ? 'width' : 'height';
  const ration = size[d] / GOOGLE_PHOTO_THUMBNAIL;
  size[d] = GOOGLE_PHOTO_THUMBNAIL;
  size[m] = Math.round(size[m] / ration);
  return {
    id: item.id,
    url: item.baseUrl,
    ...size,
    source: item.productUrl,
  };
};

const GOOGLE_PHOTO_THUMBNAIL = 512;
