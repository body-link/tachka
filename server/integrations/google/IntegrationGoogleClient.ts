import dedent from 'ts-dedent';
import { GaxiosOptions } from 'gaxios';
import { t } from '@marblejs/middleware-io';
import { google } from 'googleapis';
import { Credentials } from 'google-auth-library';
import { nonEmptyArray, NonEmptyString } from 'io-ts-types';
import { isDefined, isPresent } from '../../common/type-guards';
import { map, mergeMap, mergeMapTo, shareReplay, take } from 'rxjs/operators';
import {
  combineLatest,
  concat,
  EMPTY,
  forkJoin,
  fromEventPattern,
  Observable,
  of,
  throwError,
} from 'rxjs';
import { IntegrationState } from '../common/IntegrationState';
import { IntegrationAuthState } from '../common/IntegrationAuthState';
import { ActionableError } from '../../common/ActionableError';
import { catchErrorToUndefined } from '../../common/rxjs-utils';
import { ENV } from '../../config/env';

const ScopesType = t.keyof({
  'https://www.googleapis.com/auth/userinfo.email': null,
  'https://www.googleapis.com/auth/userinfo.profile': null,
  'https://www.googleapis.com/auth/calendar': null,
  'https://www.googleapis.com/auth/photoslibrary.readonly': null,
  'https://www.googleapis.com/auth/photoslibrary.appendonly': null,
});

type TScope = t.TypeOf<typeof ScopesType>;

export class IntegrationGoogleClient {
  static readonly state = new IntegrationState(
    'GoogleOAuth2',
    t.type({
      clientID: NonEmptyString,
      clientSecret: NonEmptyString,
    })
  );

  static readonly authState = new IntegrationAuthState(
    IntegrationGoogleClient.state,
    t.type({
      refresh_token: NonEmptyString,
      scopes: nonEmptyArray(ScopesType),
    })
  );

  protected readonly authState$ = IntegrationGoogleClient.authState.state$(this.profile);

  constructor(public readonly profile: string) {}

  setCode$ = (code: string) =>
    this.client$().pipe(
      mergeMap((client) =>
        client.getToken(code).then((s) => {
          client.setCredentials(s.tokens);
          return client;
        })
      )
    );

  verify$ = (forScopes: TScope[]) =>
    combineLatest([
      this.client$(),
      this.authState$.pipe(
        catchErrorToUndefined(),
        map((authState) => (authState?.data.scopes ?? []) as TScope[])
      ),
    ]).pipe(
      map(([client, currentScopes]) => {
        const needScopes = forScopes.filter((scope) => !currentScopes.includes(scope));
        if (needScopes.length > 0) {
          const authURL = client.generateAuthUrl({
            access_type: 'offline',
            scope: [...currentScopes, ...needScopes],
            state: this.profile,
          });
          const instruction = dedent`Profile ${this.profile} needs permissions:
              ${needScopes.join('\n')}
              Please follow the link: ${authURL}`;
          throw new ActionableError(ActionableError.ActionType.External, instruction);
        } else {
          return client;
        }
      }),
      take(1)
    );

  protected client$ = () =>
    forkJoin([
      IntegrationGoogleClient.state.state$,
      this.authState$.pipe(
        catchErrorToUndefined(),
        map((authState) => authState?.data.refresh_token)
      ),
    ]).pipe(
      map(
        ([
          {
            data: { clientID, clientSecret },
          },
          refresh_token,
        ]) => {
          const client = new google.auth.OAuth2(
            clientID,
            clientSecret,
            `${ENV.url}/custom/google-oauth2-callback`
          );
          if (isDefined(refresh_token)) {
            client.setCredentials({ refresh_token });
          }
          return client;
        }
      ),
      mergeMap((client) =>
        concat(
          of(client),
          fromEventPattern<Credentials>(
            (handler) => client.on('tokens', handler),
            (handler) => client.off('tokens', handler)
          ).pipe(
            mergeMap((credentials) => {
              const refresh_token = credentials.refresh_token;
              const scopes = (credentials.scope?.split(' ') ?? []) as TScope[];
              if (isPresent(refresh_token) && scopes.length > 0) {
                return IntegrationGoogleClient.authState
                  .setData$(this.profile, {
                    refresh_token,
                    scopes,
                  })
                  .pipe(mergeMapTo(EMPTY));
              } else {
                dedent`Received insufficient credentials.
                  Please try to fix it:
                  1. Remove access for your app: https://myaccount.google.com/permissions
                  2. Repeat authorization
                `;
                return throwError(new ActionableError(ActionableError.ActionType.External, ''));
              }
            })
          )
        )
      ),
      shareReplay(1)
    );

  protected getAccessToken$ = (forScopes: TScope[]) => {
    return this.verify$(forScopes).pipe(
      mergeMap((client) =>
        client
          .getAccessToken()
          .then((v) => v.token)
          .catch(() => undefined)
          .then((v) => {
            if (isPresent(v)) {
              return v;
            } else {
              throw new Error(dedent`
                Token is missed for ${IntegrationGoogleClient.state.id},
                please reauthorize profile ${this.profile}`);
            }
          })
      )
    );
  };

  protected request$ = <T>(forScopes: TScope[], options: GaxiosOptions): Observable<T> =>
    this.verify$(forScopes).pipe(
      mergeMap((client) => client.request<T>(options)),
      map((v) => v.data)
    );
}
