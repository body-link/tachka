import { t } from '@marblejs/middleware-io';
import { IntegrationState } from './IntegrationState';
import { map, mergeMap } from 'rxjs/operators';
import {
  IntegrationAuthEntity,
  IntegrationAuthEntityFromIntegrationAuth,
  integrationAuthRepository$,
} from '../../entities/integration_auth/typeorm';
import { isDefined } from '../../common/type-guards';
import { IIntegrationAuthRefine } from '../../entities/integration_auth/types';

export class IntegrationAuthState<
  DataType,
  DataAuthC extends t.Mixed,
  DataAuthType = t.TypeOf<DataAuthC>
> {
  constructor(
    public readonly integrationState: IntegrationState<DataType>,
    public readonly dataCodec: DataAuthC
  ) {}

  state$ = (profile: string) =>
    this.getContext$(profile).pipe(
      map(([entity]) => {
        if (isDefined(entity)) {
          return entity;
        } else {
          throw new Error(
            `Please authorize integration ${this.integrationState.id} for profile ${profile}`
          );
        }
      }),
      map(this.toObject)
    );

  setData$ = (profile: string, data: t.OutputOf<DataAuthC>) =>
    this.getContext$(profile).pipe(
      mergeMap(([entity, repository]) => {
        if (!isDefined(entity)) {
          entity = new IntegrationAuthEntity();
          entity.integration = this.integrationState.id;
          entity.profile = profile;
        }
        entity.data = JSON.stringify(data);
        return repository.save(entity);
      }),
      map(this.toObject)
    );

  private getContext$ = (profile: string) =>
    integrationAuthRepository$.pipe(
      mergeMap((repository) =>
        repository
          .findOne({ where: { integration: this.integrationState.id, profile } })
          .then((entity) => [entity, repository] as const)
      )
    );

  private toObject = (entity: IntegrationAuthEntity) =>
    IntegrationAuthEntityFromIntegrationAuth.encode(entity) as IIntegrationAuthRefine<DataAuthType>;
}
