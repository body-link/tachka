import { t } from '@marblejs/middleware-io';
import { Json, NonEmptyString } from 'io-ts-types';
import { Slug } from '../../common/io/Slug';
import { UnixTime } from '../../common/io/UnixTime';
import { optional } from '../../common/io/utils';
import { UTCOffset } from '../../common/io/UTCOffset';

export type TRecordID = NonEmptyString;

export const Record = t.type(
  {
    id: NonEmptyString,
    group: Slug,
    bucket: Slug,
    provider: Slug,
    timestamp: UnixTime,
    offset: t.union([UTCOffset, t.null]),
    data: Json,
  },
  'Record'
);

export type IRecord = t.TypeOf<typeof Record>;

export type IRecordRefine<T> = { data: T } & IRecord;

export const RecordCreate = t.type(
  {
    id: optional(NonEmptyString),
    group: Slug,
    bucket: Slug,
    provider: Slug,
    timestamp: UnixTime,
    offset: t.union([UTCOffset, t.null]),
    data: Json,
  },
  'RecordCreate'
);

export type IRecordCreate = t.TypeOf<typeof RecordCreate>;

export interface IRecordCreateRaw {
  group: string;
  bucket: string;
  provider: string;
  timestamp: number;
  offset: number | null;
  data: unknown;
}

export const RecordUpdate = t.type(
  {
    id: NonEmptyString,
    group: optional(Slug),
    bucket: optional(Slug),
    provider: optional(Slug),
    timestamp: optional(UnixTime),
    offset: optional(t.union([UTCOffset, t.null])),
    data: optional(Json),
  },
  'RecordUpdate'
);

export type IRecordUpdate = t.TypeOf<typeof RecordUpdate>;
