import dedent from 'ts-dedent';
import { r } from '@marblejs/core';
import { NonEmptyString } from 'io-ts-types';
import { requestValidator$, t } from '@marblejs/middleware-io';
import { mapTo, mergeMap } from 'rxjs/operators';
import { toBody } from '../../common/utils';
import { IntegrationGoogleClient } from '../../integrations/google/IntegrationGoogleClient';

const validateRequest = requestValidator$({
  query: t.type({
    code: NonEmptyString,
    state: NonEmptyString,
  }),
});

export const googleOAuth2CallbackEffect$ = r.pipe(
  r.matchPath('/google-oauth2-callback'),
  r.matchType('GET'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRequest,
      mergeMap(({ query }) => {
        const { code, state } = query;
        const googleClient = new IntegrationGoogleClient(state);
        const msg = dedent`
          Google integration has been successfully authorized for ${state}
          You can close this page now`;
        return googleClient.setCode$(code).pipe(mapTo(msg));
      }),
      toBody
    )
  )
);
