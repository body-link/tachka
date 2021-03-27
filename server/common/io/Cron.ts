import { t } from '@marblejs/middleware-io';
import * as cron from 'node-cron';

export interface ICronBrand {
  readonly Cron: unique symbol;
}

export type ICron = t.Branded<string, ICronBrand>;

export const Cron = t.brand(t.string, (s): s is ICron => cron.validate(s), 'Cron');
