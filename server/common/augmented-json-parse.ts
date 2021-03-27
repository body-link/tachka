import { isString } from './type-guards';

export type IExtendedJsonValue =
  | undefined
  | null
  | string
  | number
  | boolean
  | Date
  | IExtendedJsonValue[]
  | IExtendedJsonRecord;

export interface IExtendedJsonRecord {
  [key: string]: IExtendedJsonValue;
}

// matches 2019-06-20T12:29:43.288Z (with milliseconds) and 2019-06-20T12:29:43Z (without milliseconds)
const regexpStringDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,}|)Z$/;

type JsonReviver = <T extends IExtendedJsonValue>(key: string, value: T) => IExtendedJsonValue;

const internalReviver: JsonReviver = <T extends IExtendedJsonValue>(
  key: string,
  value: T
): T | Date => {
  if (isString(value) && regexpStringDate.test(value)) {
    return new Date(value);
  }
  return value;
};

export const augmentedJSONParse = <Value = IExtendedJsonValue>(text: string): Value =>
  JSON.parse(text, internalReviver);
