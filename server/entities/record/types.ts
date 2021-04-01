import { t } from '@marblejs/middleware-io';
import { Json, NonEmptyString } from 'io-ts-types';
import { Slug } from '../../common/io/Slug';
import { UnixTime } from '../../common/io/UnixTime';
import { optional } from '../../common/io/utils';
import { UTCOffset } from '../../common/io/UTCOffset';

export const Record = t.type(
  {
    id: NonEmptyString,
    group: Slug,
    bucket: Slug,
    provider: Slug,
    timestamp: UnixTime,
    offset: optional(UTCOffset),
    data: Json,
  },
  'Record'
);

export type IRecord = t.TypeOf<typeof Record>;

export type IRecordRefine<T> = { data: T } & IRecord;
