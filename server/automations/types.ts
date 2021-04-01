import { Automation } from './common/Automation';

export type TAutomationInstanceID = number;

export type TAutomationLike<T = unknown> = new (options: T) => Automation<T>;
