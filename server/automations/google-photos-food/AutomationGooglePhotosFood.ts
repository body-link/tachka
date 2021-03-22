import * as A from 'fp-ts/lib/Array';
import { IntegrationGooglePhotos } from '../../integrations/google/IntegrationGooglePhotos';
import { filter, map, mapTo, mergeMap } from 'rxjs/operators';
import { recordCreate$, recordCreateOptions } from '../../entities/record/actions/create';
import { dateToTimestamp, decodeWith, generateID, timestampToDate } from '../../common/io/utils';
import { Automation } from '../common/Automation';
import { toData } from './utils';
import { recordList$, TRecordListOptions } from '../../entities/record/actions/list';
import { debug } from '../../common/rxjs-utils';
import { IRecordRefine } from '../../entities/record/types';
import { IBucketImage } from '../../buckets/build-in/image';
import { ISlug } from '../../common/io/Slug';
import { EAutomation } from '../types';

export interface IAutomationGooglePhotosFoodOptions {
  bucket: ISlug;
  profile: string;
  initialFromDate: Date;
}

export class AutomationGooglePhotosFood extends Automation<IAutomationGooglePhotosFoodOptions> {
  readonly name = EAutomation.AutomationGooglePhotosFood;
  readonly googleAPI = new IntegrationGooglePhotos(this.options.profile);

  readonly work$ = this.googleAPI
    .verify$(['https://www.googleapis.com/auth/photoslibrary.readonly'])
    .pipe(
      mapTo({
        bucket: this.options.bucket,
        provider: this.name,
      } as TRecordListOptions),
      mergeMap(recordList$),
      mergeMap((records) => {
        if (records.length > 0) {
          const existing = records.map((v) => (v as IRecordRefine<IBucketImage>).data.id);
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
            id: generateID(),
            bucket: this.options.bucket,
            provider: this.name,
            timestamp: dateToTimestamp(date),
            offset: 0,
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
