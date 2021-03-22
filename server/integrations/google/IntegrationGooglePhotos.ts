import { IntegrationGoogleClient } from './IntegrationGoogleClient';
import { getDate, getMonth, getYear } from 'date-fns';
import { isDefined } from '../../common/type-guards';
import { map, mergeMap, reduce } from 'rxjs/operators';
import { concat, EMPTY, Observable, of } from 'rxjs';

export class IntegrationGooglePhotos extends IntegrationGoogleClient {
  // Optional date specifying the newest value that can be returned
  getRecentFoodPhotos$ = (fromDate?: Date) => {
    const startDate = isDefined(fromDate)
      ? this.toDate(fromDate)
      : { year: 1990, month: 1, day: 1 };
    const endDate = this.toDate(new Date());
    const createRequest$ = (pageToken?: string): Observable<IGoogleMediaItemResults> =>
      this.request$<IGoogleMediaItemResults>(
        ['https://www.googleapis.com/auth/photoslibrary.readonly'],
        {
          method: 'POST',
          url: 'https://photoslibrary.googleapis.com/v1/mediaItems:search',
          body: JSON.stringify({
            pageSize: 100,
            pageToken,
            filters: {
              dateFilter: {
                ranges: [
                  {
                    startDate,
                    endDate,
                  },
                ],
              },
              contentFilter: { includedContentCategories: ['FOOD'] },
              mediaTypeFilter: { mediaTypes: ['PHOTO'] },
              includeArchivedMedia: true,
            },
          }),
        }
      ).pipe(
        mergeMap((res) => {
          return concat(
            of(res),
            isDefined(res.nextPageToken) ? createRequest$(res.nextPageToken) : EMPTY
          );
        })
      );
    return createRequest$().pipe(
      map((res) => res.mediaItems ?? []),
      reduce<IGoogleMediaItem[]>((acc, items) => [...acc, ...items], [])
    );
  };

  createAlbum$ = (title: string) => {
    const album = {
      title,
    };
    return this.request$<IGoogleAlbum>(
      ['https://www.googleapis.com/auth/photoslibrary.appendonly'],
      {
        method: 'POST',
        url: 'https://photoslibrary.googleapis.com/v1/albums',
        body: JSON.stringify({ album }),
      }
    );
  };

  getMediaItems$ = () =>
    this.request$<IGoogleMediaItemResults>(
      ['https://www.googleapis.com/auth/photoslibrary.readonly'],
      {
        method: 'GET',
        url: 'https://photoslibrary.googleapis.com/v1/mediaItems',
      }
    );

  private toDate(date: Date) {
    return { year: getYear(date), month: getMonth(date) + 1, day: getDate(date) };
  }
}

export interface IGoogleMediaItem {
  id: string;
  filename: string;
  mimeType: string;
  baseUrl: string;
  productUrl: string;
  mediaMetadata: IGoogleMediaMetadata;
}

export interface IGoogleMediaMetadata {
  creationTime: Date;
  height: string;
  width: string;
  photo: Partial<IGooglePhoto>;
}

export interface IGooglePhoto {
  apertureNumber: number;
  cameraMake: string;
  cameraModel: string;
  focalLength: number;
  isoEquivalent: number;
}

export interface IGoogleAlbum {
  id: string;
  title: string;
  productUrl: string;
  isWriteable?: boolean;
  shareInfo?: {
    sharedAlbumOptions: {
      isCollaborative: boolean;
      isCommentable: boolean;
    };
    shareableUrl: string;
    shareToken: string;
    isJoined: boolean;
    isOwned: boolean;
    isJoinable: boolean;
  };
  mediaItemsCount?: string;
  coverPhotoBaseUrl?: string;
  coverPhotoMediaItemId?: string;
}

export interface IGooglePagedResults {
  nextPageToken?: string;
}

export interface IGoogleMediaItemResults extends IGooglePagedResults {
  mediaItems?: IGoogleMediaItem[];
}
