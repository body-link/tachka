import { map, mergeMap } from 'rxjs/operators';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import { TAutomationInstanceID } from '../types';
import { toAffected } from '../../../common/utils';
import { automationInstanceRepository$ } from '../typeorm';

export const automationRemoveByID$ = (
  id: TAutomationInstanceID | NonEmptyArray<TAutomationInstanceID>
) =>
  automationInstanceRepository$.pipe(
    mergeMap((repo) => repo.delete(id)),
    map(toAffected)
  );
