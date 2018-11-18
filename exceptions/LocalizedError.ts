type ProjectLocaleErrorKey = keyof ProjectLocaleErrors;
type LocalePlaceholders = Record<string, any>;

export default class LocalizedError<E extends Error> extends Error {
  constructor(public code: ProjectLocaleErrorKey, protected _args: LocalePlaceholders = {}, protected _cause?: E) {
    super(code);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }

  getPlaceholders(): { [name: string]: any } {
    const _args = this._args || {};
    return _args;
  }

  get cause(): E | undefined {
    return this._cause;
  }

  static caught<E extends Error>(code: ProjectLocaleErrorKey, args?: LocalePlaceholders) {
    return (error: E) => Promise.reject(new this(code, args, error));
  }
}
