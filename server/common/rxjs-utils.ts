import { MonoTypeOperatorFunction, NEVER, Observable, of, OperatorFunction } from 'rxjs';
import {
  catchError,
  dematerialize,
  materialize,
  startWith,
  switchMap,
  switchMapTo,
  tap,
} from 'rxjs/operators';
import { TOption } from './type-utils';

export const UNDEFINED = of(undefined);

export const catchErrorToUndefined = <T>(): OperatorFunction<T, TOption<T>> => {
  return (source: Observable<T>) => source.pipe(catchError(() => UNDEFINED));
};

export const forkDependant = <T>(
  createDependant: (value: T) => Observable<unknown>
): MonoTypeOperatorFunction<T> => {
  return (source: Observable<T>) =>
    source.pipe(
      switchMap((value) => createDependant(value).pipe(switchMapTo(NEVER), startWith(value)))
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debug = <T>(...args: any[]): MonoTypeOperatorFunction<T> => {
  return (source: Observable<T>) =>
    source.pipe(
      materialize(),
      tap((n) => console.log(...args, n)),
      dematerialize()
    );
};
