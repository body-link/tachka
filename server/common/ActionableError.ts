enum ActionType {
  Internal,
  External,
}

export class ActionableError extends Error {
  static readonly ActionType = ActionType;

  constructor(public readonly type: ActionType, public readonly instruction: string) {
    super();
    this.message = instruction;
  }
}
