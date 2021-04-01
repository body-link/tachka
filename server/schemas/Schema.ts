import * as Ajv from 'ajv';
import dedent from 'ts-dedent';
import { t } from '@marblejs/middleware-io';
import { success, failure } from 'io-ts';
import { Json, JsonFromString } from 'io-ts-types';
import { JSONSchema7 } from 'json-schema';
import { decodeWith } from '../common/io/utils';
import { isText } from '../common/type-guards';

export class Schema<T = Json> {
  readonly is: (u: unknown) => u is T;
  readonly decode: (u: unknown) => T;
  readonly type: t.Type<T>;
  readonly typeFromString: t.Type<T, string, string>;
  private readonly validate = new Ajv({ verbose: true }).compile(this.JSONSchema);

  constructor(public readonly name: string, public readonly JSONSchema: JSONSchema7) {
    const typeName = `JSONSchema7${name}`;
    this.is = (u): u is T => Json.is(u) && (this.validate(u) as boolean);
    this.type = new t.Type(
      typeName,
      this.is,
      (u, c) =>
        this.is(u)
          ? success(u)
          : failure(
              u,
              c,
              (this.validate.errors ?? [])
                .map(
                  (err) => dedent`
                    ${isText(err.dataPath) ? `Value on path ${err.dataPath}` : 'Root value'} ${
                    err.message
                  }
                    Invalid value:
                    ${JSON.stringify(err.data, undefined, 2)}
                  `
                )
                .join('\n')
            ),
      t.identity
    );
    this.typeFromString = JsonFromString.pipe(
      (this.type as unknown) as t.Type<T, Json>,
      `${typeName}FromString`
    );
    this.decode = decodeWith(this.type);
  }
}
