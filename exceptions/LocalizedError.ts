type ProjectLocaleErrorKey = keyof ProjectLocaleErrors;

export default class LocalizedError<E extends Error, K extends keyof ProjectLocaleVariables> extends Error {
  //constructor(code: K, cause: E);
  //constructor(code: K, vars: Vars, cause: E);
  constructor(
    public code: K,
    protected _args: ProjectLocaleVariables[K] extends void ? E : Exclude<ProjectLocaleVariables[K], E | Error>,
    protected _cause?: E
  ) {
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
  /*
  static caught<E extends Error, K extends ProjectLocaleErrorKey, Vars extends ProjectLocaleVariables[K]>(
    code: K,
    args: Vars extends {} ? undefined : Vars
  ) {
    return (error: E) => Promise.reject(new this(code, args, error));
  }*/
}
