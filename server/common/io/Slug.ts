import { t } from '@marblejs/middleware-io';

const regex = new RegExp('^[a-z0-9]+(?:-[a-z0-9]+)*$');

export interface ISlugBrand {
  readonly Slug: unique symbol;
}

export type ISlug = t.Branded<string, ISlugBrand>;

export const Slug = t.brand(t.string, (s): s is ISlug => regex.test(s), 'Slug');
