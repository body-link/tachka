import { map } from 'rxjs/operators';

export const toBody = map((body) => ({
  body,
}));
