import castArray from 'lodash/castArray'
import { JSONSchema7 } from 'json-schema'
import { IVEOFormSchema } from 'veo-formschema'

import { capitalize as _capitalize } from 'lodash'

interface ICmpFunction {
  (a: any, b: any): number
}

interface IHashOpts {
  cmp?: ICmpFunction
  cycles?: boolean
}

export function undefIfEmpty<T extends any>(value: T | T[] | undefined): T[] | undefined {
  const arr = castArray(value || [])
  return arr.length > 0 ? arr : undefined
}

export function hashObj(data: any, opts: IHashOpts | ICmpFunction = {}): string {
  if (typeof opts === 'function') {
    opts = { cmp: opts }
  }
  const cycles = typeof opts.cycles === 'boolean' ? opts.cycles : false

  const cmp =
    opts.cmp &&
    (function(f: ICmpFunction) {
      return function(node: any) {
        return function(a: string, b: string) {
          const aobj = { key: a, value: node[a] }
          const bobj = { key: b, value: node[b] }
          return f(aobj, bobj)
        }
      }
    })(opts.cmp)

  const seen: any[] = []
  return (function stringify(node) {
    if (node && node.toJSON && typeof node.toJSON === 'function') {
      node = node.toJSON()
    }

    if (node === undefined) {
      return 'null'
    }
    if (typeof node === 'number') {
      return isFinite(node) ? '' + node : 'null'
    }
    if (typeof node !== 'object') {
      return JSON.stringify(node)
    }

    let i, out
    if (Array.isArray(node)) {
      out = '['
      for (i = 0; i < node.length; i++) {
        if (i) {
          out += ','
        }
        out += stringify(node[i]) || 'null'
      }
      return out + ']'
    }

    if (node === null) {
      return 'null'
    }

    if (seen.includes(node)) {
      if (cycles) {
        return JSON.stringify('__cycle__')
      }
      throw new TypeError('Converting circular structure to JSON')
    }

    const seenIndex = seen.push(node) - 1
    const keys = Object.keys(node).sort(cmp && cmp(node))
    out = ''
    for (i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = stringify(node[key])

      if (!value) {
        continue
      }
      if (out) {
        out += ','
      }
      out += JSON.stringify(key) + ':' + value
    }
    seen.splice(seenIndex, 1)
    return '{' + out + '}'
  })(data)
}

export interface IBaseObject {
  [key: string]: any
}

export interface IForm {
  objectSchema: JSONSchema7
  formSchema?: IVEOFormSchema
  objectData: IBaseObject
  lang?: IBaseObject
}

export function createUUIDUrlParam(type: string, UUID: string): string {
  // UUID is exactly 36 characters long
  // If it exactly 36 characters long (raw UUID), than add type to it, else return it directly, because type is already in it
  return UUID.length !== 36 ? UUID : `${type.toLocaleLowerCase()}-${UUID}`
}

interface IUUIDParam {
  type: string
  id: string
}

export function separateUUIDParam(param: string | undefined): IUUIDParam {
  // if param is not defined, make it string; TODO: check if this can cause bugs
  const stringParam = param || ''
  // returns id with 36 characters from the structure type-UUID
  const id = stringParam.slice(-36)
  return {
    type: stringParam.replace(`-${id}`, ''),
    id: id
  }
}

export function capitalize(string: string, ignoreFollowingCharacterCasing: boolean = false) {
  if(ignoreFollowingCharacterCasing) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  } else {
    return _capitalize(string)
  }
}
