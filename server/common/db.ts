import { defer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { createConnection } from 'typeorm';
import options from '../ormconfig';

export const connection$ = defer(() => createConnection(options)).pipe(shareReplay(1));
