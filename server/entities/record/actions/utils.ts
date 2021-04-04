import dedent from 'ts-dedent';
import { IRecord } from '../types';
import { getBuiltInBucket } from '../../../buckets/built-in/register';
import { isDefined, isError } from '../../../common/type-guards';
import { decodeWith } from '../../../common/io/utils';
import { RecordEntityFromRecord } from '../typeorm';

export const convertRecordToRecordEntity = (record: IRecord, index: number = 0) => {
  try {
    const builtInBucket = getBuiltInBucket(record.bucket);
    if (isDefined(builtInBucket)) {
      record.data = builtInBucket.decode(record.data);
    }
    return decodeRecordEntityFromRecord(record);
  } catch (error) {
    const msg = isError(error) ? error.message : '';
    throw new Error(dedent`
      Record ID ${record.id} with index ${index} is invalid
      Reason: ${msg}
    `);
  }
};

const decodeRecordEntityFromRecord = decodeWith(RecordEntityFromRecord);
