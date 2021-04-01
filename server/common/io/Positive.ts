import { t } from '@marblejs/middleware-io';

interface IPositiveBrand {
  readonly Positive: unique symbol; // use `unique symbol` here to ensure uniqueness across modules / packages
}

export type IPositive = t.Branded<number, IPositiveBrand>;

export const Positive = t.brand(
  t.number, // a codec representing the type to be refined
  (n): n is IPositive => 0 < n, // a custom type guard using the built-in helper `Branded`
  'Positive' // the name must match the readonly field in the brand
);

export const PositiveInt = t.intersection([t.Int, Positive]);

export type IPositiveInt = t.TypeOf<typeof PositiveInt>;
