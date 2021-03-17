export type TIdentifier = string | number;

export type TReal = boolean | string | number;

export type TPrimitive = undefined | null | TReal;

export type TOption<T> = T | undefined;

export type TNullable<T> = T | undefined | null;

export type TUnboxArray<T> = T extends (infer U)[] ? U : T;

export type TNoop = () => void;

export type TMutable<T> = {
  -readonly [P in keyof T]: T[P];
};
