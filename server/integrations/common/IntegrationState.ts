import { Observable, of } from 'rxjs';
import { map, mergeMap, withLatestFrom } from 'rxjs/operators';
import {
  IntegrationDataEntityFromIntegrationData,
  integrationDataRepository$,
} from '../../entities/integration_data/typeorm';
import { IIntegrationDataRefine } from '../../entities/integration_data/types';
import { Schema } from '../../schemas/Schema';
import { decodeWith } from '../../common/io/utils';
import { toAffected } from '../../common/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const integrationStateReg = new Map<string, IntegrationState<any>>();

export class IntegrationState<DataType> {
  state$ = integrationDataRepository$.pipe(
    mergeMap((repo) => repo.findOneOrFail(this.id)),
    map(IntegrationDataEntityFromIntegrationData.encode)
  ) as Observable<IIntegrationDataRefine<DataType>>;

  constructor(public readonly id: string, public readonly schemaOptions: Schema<DataType>) {
    integrationStateReg.set(id, this);
  }

  setData$ = (rawData: DataType) =>
    of(rawData).pipe(
      map(this.schemaOptions.decode),
      map((d) => ({ id: this.id, data: d })),
      map(decodeWith(IntegrationDataEntityFromIntegrationData)),
      withLatestFrom(integrationDataRepository$),
      mergeMap(([entity, repository]) => repository.save(entity)),
      map(IntegrationDataEntityFromIntegrationData.encode)
    ) as Observable<IIntegrationDataRefine<DataType>>;

  removeData$ = () =>
    integrationDataRepository$.pipe(
      mergeMap((repo) => repo.delete(this.id)),
      map(toAffected)
    );
}
