import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { t } from '@marblejs/middleware-io';
import { either } from 'fp-ts/Either';
import { Record, TRecord } from './types';
import { isDefined, isNull } from '../../common/type-guards';

@Entity({
  name: 'record',
})
export class RecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  bucket!: string;

  @Column()
  @Index()
  provider!: string;

  @Column('int', { width: 11, unsigned: true })
  @Index()
  timestamp!: number;

  @Column('smallint', { nullable: true })
  offset!: number | null;

  @Column('simple-json')
  data!: string;
}

export interface IRecordEntityFromRecord extends t.Type<RecordEntity, TRecord, unknown> {}

export const RecordEntityFromRecord: IRecordEntityFromRecord = new t.Type<
  RecordEntity,
  TRecord,
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
    const d: TRecord = { ...(a as TRecord), data: JSON.parse(a.data) };
    if (isNull(a.offset)) {
      delete d.offset;
    }
    return d;
  }
);
