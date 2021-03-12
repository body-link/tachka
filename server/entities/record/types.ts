import { t } from '@marblejs/middleware-io';
import { Json, UUID } from 'io-ts-types';
import { Slug } from '../../common/io/Slug';
import { UnixTime } from '../../common/io/UnixTime';
import { optional } from '../../common/io/utils';
import { UTCOffset } from '../../common/io/UTCOffset';

export const Record = t.type(
  {
    id: UUID,
    bucket: Slug,
    provider: Slug,
    timestamp: UnixTime,
    offset: optional(UTCOffset),
    data: Json,
  },
  'Record'
);

export type TRecord = t.TypeOf<typeof Record>;
