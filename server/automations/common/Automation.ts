import { BehaviorSubject, concat, Observable, of, Unsubscribable } from 'rxjs';
import { catchError, exhaustMap, last, mapTo, takeUntil } from 'rxjs/operators';
import { ca } from '../../common/action-helpers';
import { EAutomation } from '../register';

export type TAutomationLike<T = unknown> = new (options: T) => Automation<T>;

export abstract class Automation<TOptions = unknown> implements Unsubscribable {
  readonly state$ = new BehaviorSubject<Error | boolean>(false);
  readonly start = ca();
  readonly forceStop = ca();

  private sub = this.start.$.pipe(
    exhaustMap(() =>
      concat(
        of(true),
        this.work$.pipe(
          takeUntil(this.forceStop.$),
          last(undefined, false),
          mapTo(false),
          catchError((err: Error) => of(err))
        )
      )
    )
  ).subscribe((state) => this.state$.next(state));

  abstract readonly name: EAutomation;
  abstract readonly work$: Observable<unknown>;

  constructor(public readonly options: TOptions) {}

  readonly unsubscribe = () => this.sub.unsubscribe();
}
