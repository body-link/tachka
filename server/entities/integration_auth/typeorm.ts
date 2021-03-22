import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { t } from '@marblejs/middleware-io';
import { either } from 'fp-ts/Either';
import { IIntegrationAuth, IntegrationAuth } from './types';
import { IntegrationDataEntity } from '../integration_data/typeorm';
import { map } from 'rxjs/operators';
import { connection$ } from '../../common/db';

@Entity({
  name: 'integration_auth',
})
export class IntegrationAuthEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column('varchar', { length: 128, nullable: false })
  integration!: string;

  @Column('varchar', { length: 128, nullable: false })
  profile!: string;

  @Column('simple-json', { nullable: false })
  data!: string;

  @ManyToOne(() => IntegrationDataEntity, (i) => i.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'integration' })
  integrationData!: IntegrationDataEntity;
}

export interface IIntegrationDataEntityFromIntegrationData
  extends t.Type<IntegrationAuthEntity, IIntegrationAuth> {}

export const IntegrationAuthEntityFromIntegrationAuth: IIntegrationDataEntityFromIntegrationData = new t.Type<
  IntegrationAuthEntity,
  IIntegrationAuth,
  unknown
>(
  'IntegrationDataEntityFromIntegrationData',
  (u): u is IntegrationAuthEntity => u instanceof IntegrationAuthEntity,
  (u, c) =>
    either.chain(IntegrationAuth.validate(u, c), (i) => {
      try {
        return t.success(({
          ...i,
          data: JSON.stringify(i.data),
        } as unknown) as IntegrationAuthEntity);
      } catch (error) {
        return t.failure(u, c, String(error));
      }
    }),
  (a) => {
    const d: IIntegrationAuth = {
      ...((a as unknown) as IIntegrationAuth),
      data: JSON.parse(a.data),
    };
    return d;
  }
);

export const integrationAuthRepository$ = connection$.pipe(
  map((connection) => connection.getRepository(IntegrationAuthEntity))
);
