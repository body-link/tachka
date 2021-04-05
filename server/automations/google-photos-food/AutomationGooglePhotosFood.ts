import * as A from 'fp-ts/lib/Array';
import {
  IGoogleMediaItem,
  IntegrationGooglePhotos,
} from '../../integrations/google/IntegrationGooglePhotos';
import { filter, map, mapTo, mergeMap } from 'rxjs/operators';
import { recordCreate$, recordCreateOptions } from '../../entities/record/actions/create';
import { dateToTimestamp, decodeWith, timestampToDate } from '../../common/io/utils';
import { Automation } from '../common/Automation';
import { toData } from './utils';
import { recordList$, TRecordListOptions } from '../../entities/record/actions/list';
import { debug } from '../../common/rxjs-utils';
import { IRecordRefine } from '../../entities/record/types';
import { ISchemaImage } from '../../schemas/schema-image';
import { EBuiltInBucket } from '../../buckets/built-in/register';
import { ISchemaAutomationGooglePhotosFoodOptions } from './schema-options';
import { EAutomation } from '../register';

export class AutomationGooglePhotosFood extends Automation<ISchemaAutomationGooglePhotosFoodOptions> {
  readonly name = EAutomation.GooglePhotosFood;
  readonly googleAPI = new IntegrationGooglePhotos(this.options.profile);

  readonly work$ = this.googleAPI
    .verify$(['https://www.googleapis.com/auth/photoslibrary.readonly'])
    .pipe(
      mapTo({
        group: this.options.recordGroup,
        provider: this.name,
      } as TRecordListOptions),
      mergeMap(recordList$),
      mergeMap((records) => {
        if (records.length > 0) {
          const existing = records.map((v) => (v as IRecordRefine<ISchemaImage>).data.id);
          return this.googleAPI
            .getRecentFoodPhotos$(timestampToDate(records[0].timestamp))
            .pipe(map((items) => items.filter((v) => !existing.includes(v.id))));
        } else {
          return this.googleAPI.getRecentFoodPhotos$(this.options.initialFromDate);
        }
      }),
      filter(A.isNonEmpty),
      map((items) =>
        items.map((item) => {
          const date = new Date(item.mediaMetadata.creationTime);
          return {
            id: getItemID(item),
            group: this.options.recordGroup,
            bucket: EBuiltInBucket.PhotosFood,
            provider: this.name,
            timestamp: dateToTimestamp(date),
            offset: null,
            data: toData(item),
          };
        })
      ),
      map(decodeWith(recordCreateOptions)),
      mergeMap(recordCreate$),
      map((items) => `Add ${items.length} records`),
      debug(this.name)
    );
}

const getItemID = (item: IGoogleMediaItem) => `AuGPF__${item.id}`;
