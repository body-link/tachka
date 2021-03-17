import { requestValidator$ } from '@marblejs/middleware-io';
import { r } from '@marblejs/core';
import { mergeMap } from 'rxjs/operators';
import { isDefined } from '../../../common/type-guards';
import { failure } from 'io-ts/PathReporter';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { throwError } from 'rxjs';
import { toBody } from '../../../common/utils';
import { integrationStateReg } from '../../../integrations/common/IntegrationState';
import { IntegrationData } from '../../../entities/integration_data/types';

const validateRequest = requestValidator$({
  body: IntegrationData,
});

export const integrationDataSetEffect$ = r.pipe(
  r.matchPath('/set'),
  r.matchType('POST'),
  r.useEffect((req$) =>
    req$.pipe(
      validateRequest,
      mergeMap(({ body: { id, data } }) => {
        const integration = integrationStateReg.get(id);
        if (isDefined(integration)) {
          return pipe(
            integration.dataCodec.decode(data),
            E.fold((errors) => throwError(failure(errors)), integration.setData$)
          );
        }
        return throwError(new Error(`Integration ${id} doesn't exist`));
      }),
      toBody
    )
  )
);
