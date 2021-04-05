import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/pipeable';
import { HttpRequest } from '@marblejs/core';

const extractToken = (header: string) => header.replace('Bearer ', '');

export const parseAuthorizationHeader = (req: HttpRequest) =>
  pipe(
    O.fromNullable(req.headers.authorization),
    O.map(extractToken),
    O.getOrElseW(() => {
      throw new Error('Authorization is required');
    })
  );
