import { ISchemaImage } from '../../schemas/schema-image';
import { IGoogleMediaItem } from '../../integrations/google/IntegrationGooglePhotos';

export const getItemID = (item: IGoogleMediaItem) => `AuGPF__${item.id}`;

export const toData = (item: IGoogleMediaItem): ISchemaImage => ({
  id: item.id,
  url: item.productUrl,
  width: parseInt(item.mediaMetadata.width),
  height: parseInt(item.mediaMetadata.height),
});
