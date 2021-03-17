import { t } from '@marblejs/middleware-io';
import { IntegrationState } from './IntegrationState';
import { integrationAuthRepository$ } from '../../common/db';
import { map, switchMap } from 'rxjs/operators';
import {
  IntegrationAuthEntity,
  IntegrationAuthEntityFromIntegrationAuth,
} from '../../entities/integration_auth/typeorm';
import { isDefined } from '../../common/type-guards';
import { IIntegrationAuthRefine } from '../../entities/integration_auth/types';

export class IntegrationAuthState<
  DataC extends t.Mixed,
  DataAuthC extends t.Mixed,
  DataAuthType = t.TypeOf<DataAuthC>
> {
  constructor(
    public readonly integrationState: IntegrationState<DataC>,
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
      switchMap(([entity, repository]) => {
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
      switchMap((repository) =>
        repository
          .findOne({ where: { integration: this.integrationState.id, profile } })
          .then((entity) => [entity, repository] as const)
      )
    );

  private toObject = (entity: IntegrationAuthEntity) =>
    IntegrationAuthEntityFromIntegrationAuth.encode(entity) as IIntegrationAuthRefine<DataAuthType>;
}
