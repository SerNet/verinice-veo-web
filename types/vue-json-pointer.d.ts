declare module 'vue-json-pointer' {
  const api: API

  interface API {
    (obj: any, pointer: string): any
    (obj: any, pointer: string, value: any): void

    /**
     *  Wrap an object with accessors
     */
    /**
     *  Looks up a JSON pointer in an object.
     */
    get(object: Object, pointer: string): any
    /**
     *  Set a value for a JSON pointer on object.
     */
    set(object: Object, pointer: string, value: any): void
    /**
     *  Removes an attribute of object referenced by pointer
     */
    remove(object: Object, pointer: string): void
    /**
     *  Creates a dictionary object (pointer -> value).
     */
    dict(object: Object): Object
    /**
     *  Just like: each(pointer.dict(obj), iterator);
     */
    walk(object: Object, iterator: (value: any, key: string) => void): void
    /**
     *  Tests if an object has a value for a JSON pointer.
     */
    has(object: Object, pointer: string): boolean
    /**
     *  Escapes a reference token.
     */
    escape(str: string): string
    /**
     *  Unescape a reference token.
     */
    unescape(str: string): string
    /**
     *  Converts a JSON pointer into an array of reference tokens.
     */
    parse(str: string): string[]
    /**
     *  Builds a json pointer from an array of reference tokens.
     */
    compile(str: string[]): string
  }

  export = api
}
