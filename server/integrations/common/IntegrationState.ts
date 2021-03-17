import { t } from '@marblejs/middleware-io';
import { integrationDataRepository$ } from '../../common/db';
import { map, switchMap } from 'rxjs/operators';
import {
  IntegrationDataEntity,
  IntegrationDataEntityFromIntegrationData,
} from '../../entities/integration_data/typeorm';
import { isDefined } from '../../common/type-guards';
import { IIntegrationDataRefine } from '../../entities/integration_data/types';

export const integrationStateReg = new Map<string, IntegrationState<t.Mixed>>();

export class IntegrationState<DataC extends t.Mixed, DataType = t.TypeOf<DataC>> {
  state$ = integrationDataRepository$.pipe(
    switchMap((repository) => repository.findOne({ where: { id: this.id } })),
    map((entity) => {
      if (isDefined(entity)) {
        return this.toObject(entity);
      } else {
        throw new Error(`Please create integration ${this.id}`);
      }
    })
  );

  constructor(public readonly id: string, public readonly dataCodec: DataC) {
    integrationStateReg.set(id, this);
  }

  setData$ = (data: DataType) =>
    integrationDataRepository$.pipe(
      switchMap((repository) => repository.save({ id: this.id, data: JSON.stringify(data) })),
      map(this.toObject)
    );

  private toObject = (entity: IntegrationDataEntity) =>
    IntegrationDataEntityFromIntegrationData.encode(entity) as IIntegrationDataRefine<DataType>;
}
