import { map } from 'rxjs/operators';

export const toBody = map((body?: unknown) => ({
  body: body ?? { ok: true },
}));
