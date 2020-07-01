import castArray from 'lodash/castArray'

import JsonPointer from 'json-ptr'

import { JSONSchema7 } from 'json-schema'

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

export function preprocessSchemaForTranslation(schema: JSONSchema7): JSONSchema7 {
  schema.$schema = 'http://json-schema.org/draft-07/schema#'

  JsonPointer.list(schema, '#')
    .filter((obj: any) => {
      const lastThreeProperties = obj.fragmentId.split('/').slice(-3)
      return lastThreeProperties[0] !== 'type' && lastThreeProperties[1] === 'enum' && !isNaN(lastThreeProperties[2])
    })
    .forEach((obj: any) => {
      JsonPointer.set(schema, obj.fragmentId, `#lang/${obj.value}`)
    })

  return schema
}

export interface IBaseObject {
  [key: string]: any
}

export interface IForm {
  objectSchema: JSONSchema7
  formSchema: IBaseObject
  value: IBaseObject
  lang?: IBaseObject
}
