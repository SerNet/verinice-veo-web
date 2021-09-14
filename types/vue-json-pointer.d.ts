/*
 * verinice.veo web
 * Copyright (C) 2021  Markus Werner
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
declare module 'vue-json-pointer' {
  interface API {
    (obj: any, pointer: string): any;
    (obj: any, pointer: string, value: any): void;

    /**
     *  Wrap an object with accessors
     */
    /**
     *  Looks up a JSON pointer in an object.
     */
    get(object: Object, pointer: string): any;
    /**
     *  Set a value for a JSON pointer on object.
     */
    set(object: Object, pointer: string, value: any): void;
    /**
     *  Removes an attribute of object referenced by pointer
     */
    remove(object: Object, pointer: string): void;
    /**
     *  Creates a dictionary object (pointer -> value).
     */
    dict(object: Object): Object;
    /**
     *  Just like: each(pointer.dict(obj), iterator);
     */
    walk(object: Object, iterator: (value: any, key: string) => void): void;
    /**
     *  Tests if an object has a value for a JSON pointer.
     */
    has(object: Object, pointer: string): boolean;
    /**
     *  Escapes a reference token.
     */
    escape(str: string): string;
    /**
     *  Unescape a reference token.
     */
    unescape(str: string): string;
    /**
     *  Converts a JSON pointer into an array of reference tokens.
     */
    parse(str: string): string[];
    /**
     *  Builds a json pointer from an array of reference tokens.
     */
    compile(str: string[]): string;
  }

  const api: API;
  export = api;
}
