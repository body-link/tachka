import { IGoogleMediaItem } from '../../integrations/google/IntegrationGooglePhotos';
import { ISchemaCommonImage } from '../../schemas/types';

export const getItemID = (item: IGoogleMediaItem) => `AuGPF__${item.id}`;

export const toData = (item: IGoogleMediaItem): ISchemaCommonImage => ({
  id: item.id,
  url: item.productUrl,
  width: parseInt(item.mediaMetadata.width),
  height: parseInt(item.mediaMetadata.height),
});
