import * as Ajv from 'ajv';
import { t } from '@marblejs/middleware-io';
import { success, failure } from 'io-ts';
import { JsonRecord, JsonFromString } from 'io-ts-types';
import { JSONSchema7 } from 'json-schema';
import { decodeWith } from '../../common/io/utils';

export class Bucket<T = JsonRecord> {
  readonly is: (u: unknown) => u is T;
  readonly decode: (u: unknown) => T;
  readonly type: t.Type<T>;
  readonly typeFromString: t.Type<T, string, string>;
  private readonly validate = new Ajv({ verbose: true }).compile(this.JSONSchema);

  constructor(public readonly name: string, public readonly JSONSchema: JSONSchema7) {
    this.is = (u): u is T => JsonRecord.is(u) && (this.validate(u) as boolean);
    this.type = new t.Type(
      this.name,
      this.is,
      (u, c) =>
        this.is(u)
          ? success(u)
          : failure(
              u,
              c,
              (this.validate.errors ?? [])
                .map((err) => `Path ${err.dataPath} value ${err.data} ${err.message}`)
                .join('\n')
            ),
      t.identity
    );
    this.typeFromString = JsonFromString.pipe(
      (this.type as unknown) as t.Type<T, JsonRecord>,
      `${this.name}FromString`
    );
    this.decode = decodeWith(this.type);
  }
}
