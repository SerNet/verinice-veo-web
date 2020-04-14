import { Plugin, Context } from '@nuxt/types'
import mapValues from 'lodash/mapValues'
import axios, { AxiosRequestConfig } from 'axios'
import { hashObj } from '~/lib/utils'

export class API extends Client({ }) {
  protected $url = process.server ? process.env._AXIOS_BASE_URL_ + 'api' : '/api'

  constructor(protected $context: Context) {
    super()
  }

  public $log = this.$context.app.$logger.withTag('api')

  public request<T>(options: AxiosRequestConfig) {
    return axios.request<T>(options)
  }
}

type ReturnFunction = (...args: any[]) => any

function Client<Methods extends Record<string, ReturnFunction>>(methods: Methods) {
  class Base {
    public $cache = new Map<string, Promise<any>>()
    public withCache = mapValues(methods, (value) => {
      return (...args: Parameters<typeof value>): ReturnType<typeof value> => {
        const key = hashObj(args)
        const cached = this.$cache.get(key)
        if (cached) {
          return cached as any
        } else {
          const promise = value.apply(this, args)
          this.$cache.set(key, promise)
          promise.catch(() => this.$cache.delete(key))
          return promise
        }
      }
    }) as { [K in keyof Methods]: (...args: Parameters<Methods[K]>) => ReturnType<Methods[K]> }
  }

  Object.assign(Base.prototype, methods)
  return Base as { new (): (Methods & Base) }
}

export class AppError extends Error {
  constructor(public action: string, public description: string, public code?: string, public request?: any, public response?: any) {
    super(description)
    this.name = `${action} Error ${code}`
  }
}

export default (function(context, inject) {
  const api = new API(context)
  inject('api', api)
} as Plugin)
