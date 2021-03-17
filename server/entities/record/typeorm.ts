import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { t } from '@marblejs/middleware-io';
import { either } from 'fp-ts/Either';
import { Record, IRecord } from './types';
import { isDefined, isNull } from '../../common/type-guards';

@Entity({
  name: 'record',
})
export class RecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { nullable: false })
  @Index()
  bucket!: string;

  @Column('varchar', { nullable: false })
  @Index()
  provider!: string;

  @Column('int', { unsigned: true, nullable: false })
  @Index()
  timestamp!: number;

  @Column('smallint', { nullable: true })
  offset!: number | null;

  @Column('simple-json', { nullable: false })
  data!: string;
}

export interface IRecordEntityFromRecord extends t.Type<RecordEntity, IRecord, unknown> {}

export const RecordEntityFromRecord: IRecordEntityFromRecord = new t.Type<
  RecordEntity,
  IRecord,
  unknown
>(
  'RecordEntityFromRecord',
  (u): u is RecordEntity => u instanceof RecordEntity,
  (u, c) =>
    either.chain(Record.validate(u, c), (i) => {
      try {
        return t.success({
          ...i,
          data: JSON.stringify(i.data),
          offset: isDefined(i.offset) ? i.offset : null,
        });
      } catch (error) {
        return t.failure(u, c, String(error));
      }
    }),
  (a) => {
    const d: IRecord = { ...(a as IRecord), data: JSON.parse(a.data) };
    if (isNull(a.offset)) {
      delete d.offset;
    }
    return d;
  }
);
