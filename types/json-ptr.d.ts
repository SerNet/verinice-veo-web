declare module 'json-ptr' {
  class JsonPointer {
    path: string[]
    pointer: string
    uriFragmentIdentifier: string

    static create(pointer: string): JsonPointer
    static has(target: object, pointer: string): boolean
    static get(target: object, pointer: string): any
    static set(target: object, pointer: string, value: any, force?: boolean): void
    static flatten(target: object, fragmentId: string): any
    static list(target: object, fragmentId: string): any[]
    static map(target: object, fragmentId: string): any[]
    static decode(pointer: string): string[]
  }

  class JsonReference {
    constructor(pointer: string)
    isReference(obj: any): boolean
  }

  export = JsonPointer
}
