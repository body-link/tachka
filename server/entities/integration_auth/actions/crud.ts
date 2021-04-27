import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { IIntegrationAuth, IIntegrationAuthCreate, TIntegrationAuthID } from '../types';
import {
  IntegrationAuthEntity,
  IntegrationAuthEntityFromIntegrationAuth,
  integrationAuthRepository$,
} from '../typeorm';
import { toAffected } from '../../../common/utils';

export const integrationAuthGetByID$ = (id: TIntegrationAuthID): Observable<IIntegrationAuth> =>
  integrationAuthRepository$.pipe(
    mergeMap((repo) => repo.findOneOrFail(id)),
    map(IntegrationAuthEntityFromIntegrationAuth.encode)
  );

export const integrationAuthGetAll$ = (): Observable<IIntegrationAuth[]> =>
  integrationAuthRepository$.pipe(
    mergeMap((repo) => repo.find()),
    map((records) => records.map(IntegrationAuthEntityFromIntegrationAuth.encode))
  );

export const integrationAuthSave$ = ({
  data,
  ...rest
}: IIntegrationAuthCreate | IIntegrationAuth): Observable<IIntegrationAuth> =>
  integrationAuthRepository$.pipe(
    mergeMap((repo) =>
      repo.save(
        repo.merge(new IntegrationAuthEntity(), rest, {
          data: JSON.stringify(data),
        })
      )
    ),
    map(IntegrationAuthEntityFromIntegrationAuth.encode)
  );

export const integrationAuthRemoveByID$ = (id: TIntegrationAuthID) =>
  integrationAuthRepository$.pipe(
    mergeMap((repo) => repo.delete(id)),
    map(toAffected)
  );
