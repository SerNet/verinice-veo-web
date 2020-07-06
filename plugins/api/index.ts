import defaultsDeep from 'lodash/defaultsDeep'
import { Plugin, Context } from '@nuxt/types'

import { VeoError, VeoErrorTypes } from '~/types/VeoError'

import asset from '~/plugins/api/asset'
import control from '~/plugins/api/control'
import group from '~/plugins/api/group'
import person from '~/plugins/api/person'
import process from '~/plugins/api/process'
import schema from '~/plugins/api/schema'
import translation from '~/plugins/api/translation'
import unit from '~/plugins/api/unit'

export function createAPI(context: Context) {
  return Client.create(context, { asset, control, group, person, process, schema, translation, unit })
}

export interface IAPIClient {
  (api: Client): Object
}

export class Client {
  public build: string
  public version: string
  public baseURL: string
  // public sentry: any

  static create<T extends Record<keyof T, IAPIClient>>(
    context: Context,
    namespaces: T
  ): Client & { [K in keyof T]: ReturnType<T[K]> } {
    const instance: any = new this(context)
    for (const key in namespaces) {
      instance[key] = namespaces[key](instance)
    }
    return instance
  }

  constructor(protected context: Context) {
    this.build = context.$config.build
    this.version = context.$config.version
    this.baseURL = `${context.$config.apiHost}`.replace(/\/$/, '')
    // this.sentry = context.app.$sentry
  }

  public getURL(url: string) {
    const _url = String(url).replace(/^\/api/, this.baseURL)
    if (_url.startsWith('/')) {
      const loc = window.location
      return `${loc.protocol}//${loc.host}${_url}`
    }
    return _url
  }

  public async req(url: string, options: RequestOptions & {method: 'DELETE'}): Promise<void>
  public async req<T = any>(url: string, options?: RequestOptions): Promise<T>

  /**
   * Basic request function used by all api namespaces
   */
  public async req(url: string, options: RequestOptions = {}) {
    const $user = this.context.app.$auth

    const defaults = {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + $user.getToken(),
        'x-client-build': this.build,
        'x-client-version': this.version
      } as Record<string, string>,
      method: 'GET',
      mode: 'cors'
    }

    if (options.json) {
      options.body = JSON.stringify(options.json)
      defaults.method = 'POST'
      defaults.headers['Content-Type'] = 'application/json'
    }

    if (options.retry === undefined) {
      // options.retry = true
    }

    const combinedOptions = defaultsDeep(options, defaults)
    combinedOptions.headers.Authorization = defaults.headers.Authorization

    let queryString = ''
    if (options.params !== undefined) {
      for (const key in options.params) {
        const value = options.params[key]
        if (value !== undefined) {
          queryString += '&' + key + '=' + encodeURIComponent(value)
        }
      }
    }
    const combinedUrl = queryString === '' ? url : url + '?' + queryString.substr(1)

    try {
      const reqURL = combinedUrl.replace(/^\/api/, this.baseURL)
      const res = await fetch(reqURL, combinedOptions)
      if (Number(res.status) === 401) {
        /* if (options.retry) {
          if (await $user.refreshSession()) {
            return this.req(url, { ...options, retry: false })
          }
        } */
        await $user.logout()
        return Promise.reject(new Error('invalid jwt'))
      } else if (options.method === 'DELETE') {
        return Promise.resolve()
      } else {
        return await this.parseResponse(reqURL, res)
      }
    } catch (e) {
      // this.sentry.setTag('error_level', 'warning')
      // this.sentry.captureException(e)
      return Promise.reject(e)
    }
  }

  async parseResponse<T>(url: string, res: Response): Promise<T> {
    const raw = await res.text()

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch (e) {
      throw new VeoError('Non JSON response')
    }
    if (parsed) {
      if (res.status >= 200 && res.status <= 300) {
        return parsed
      } else if (parsed.code) {
        throw new VeoError(parsed.code, VeoErrorTypes.VEO_ERROR_COMMON)
      } else {
        const e = new Error(`Error ${res.status || '?'} while accessing ${url}`)
        e.name = 'API_EXCEPTION'
        throw e
      }
    } else {
      throw new VeoError('Invalid response')
    }
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>
  json?: any
  retry?: boolean,
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS'
}

export default (function(context, inject) {
  inject('api', createAPI(context))
} as Plugin)

export type Injection = ReturnType<typeof createAPI>
export type API = Injection
