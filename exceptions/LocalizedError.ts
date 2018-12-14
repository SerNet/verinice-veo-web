type ProjectLocaleErrorKey = keyof ProjectLocaleErrors;

export default class LocalizedError<
  E extends Error,
  K extends ProjectLocaleErrorKey,
  Vars extends ProjectLocaleVariables[K]
> extends Error {
  constructor(code: K, _cause?: E);
  constructor(code: K, _args: Vars, _cause?: E);

  constructor(public code: K, protected _args?: Vars, protected _cause?: E) {
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

  static caught<E extends Error, K extends ProjectLocaleErrorKey, Vars extends ProjectLocaleVariables[K]>(
    code: K,
    args?: Vars
  ) {
    return (error: E) => Promise.reject(new this(code, args, error));
  }
}
