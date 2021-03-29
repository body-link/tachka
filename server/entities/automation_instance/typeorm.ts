import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { t } from '@marblejs/middleware-io';
import { either } from 'fp-ts/Either';
import { AutomationInstance, IAutomationInstance } from './types';
import { map } from 'rxjs/operators';
import { augmentedJSONParse } from '../../common/augmented-json-parse';
import { connection$ } from '../../config/typeorm';

@Entity({
  name: 'automation_instance',
})
export class AutomationInstanceEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column('varchar', { length: 128, nullable: false })
  automation!: string;

  @Column('simple-json', { nullable: false })
  options!: string;

  @Column('varchar', { length: 128, nullable: true })
  schedule!: string | null;

  @Column('boolean', { nullable: false })
  isOn!: boolean;
}

export interface IAutomationInstanceEntityFromAutomationInstance
  extends t.Type<AutomationInstanceEntity, IAutomationInstance> {}

export const AutomationInstanceEntityFromAutomationInstance: IAutomationInstanceEntityFromAutomationInstance = new t.Type<
  AutomationInstanceEntity,
  IAutomationInstance,
  unknown
>(
  'AutomationInstanceEntityFromAutomationInstance',
  (u): u is AutomationInstanceEntity => u instanceof AutomationInstanceEntity,
  (u, c) =>
    either.chain(AutomationInstance.validate(u, c), (i) => {
      try {
        return t.success(({
          ...i,
          options: JSON.stringify(i.options),
        } as unknown) as AutomationInstanceEntity);
      } catch (error) {
        return t.failure(u, c, String(error));
      }
    }),
  (a) => {
    const d: IAutomationInstance = {
      ...((a as unknown) as IAutomationInstance),
      options: augmentedJSONParse(a.options),
    };
    return d;
  }
);

export const automationInstanceRepository$ = connection$.pipe(
  map((connection) => connection.getRepository(AutomationInstanceEntity))
);
