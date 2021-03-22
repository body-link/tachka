import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { t } from '@marblejs/middleware-io';
import { either } from 'fp-ts/Either';
import { IIntegrationData, IntegrationData } from './types';
import { IntegrationAuthEntity } from '../integration_auth/typeorm';
import { map } from 'rxjs/operators';
import { connection$ } from '../../common/db';

@Entity({
  name: 'integration_data',
})
export class IntegrationDataEntity {
  @PrimaryColumn('varchar', { length: 128, nullable: false })
  id!: string;

  @Column('simple-json', { nullable: false })
  data!: string;

  @OneToMany(() => IntegrationAuthEntity, (i) => i.integration)
  auth!: IntegrationAuthEntity[];
}

export interface IIntegrationDataEntityFromIntegrationData
  extends t.Type<IntegrationDataEntity, IIntegrationData> {}

export const IntegrationDataEntityFromIntegrationData: IIntegrationDataEntityFromIntegrationData = new t.Type<
  IntegrationDataEntity,
  IIntegrationData,
  unknown
>(
  'IntegrationDataEntityFromIntegrationData',
  (u): u is IntegrationDataEntity => u instanceof IntegrationDataEntity,
  (u, c) =>
    either.chain(IntegrationData.validate(u, c), (i) => {
      try {
        return t.success(({
          ...i,
          data: JSON.stringify(i.data),
        } as unknown) as IntegrationDataEntity);
      } catch (error) {
        return t.failure(u, c, String(error));
      }
    }),
  (a) => {
    const d: IIntegrationData = {
      ...((a as unknown) as IIntegrationData),
      data: JSON.parse(a.data),
    };
    return d;
  }
);

export const integrationDataRepository$ = connection$.pipe(
  map((connection) => connection.getRepository(IntegrationDataEntity))
);
