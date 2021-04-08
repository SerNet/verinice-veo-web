import defaultsDeep from 'lodash/defaultsDeep'
import { Plugin, Context } from '@nuxt/types'

import { VeoError, VeoErrorTypes } from '~/types/VeoError'

import entity from '~/plugins/api/entity'
import form from '~/plugins/api/form'
import schema from '~/plugins/api/schema'
import translation from '~/plugins/api/translation'
import unit from '~/plugins/api/unit'
import { User } from '~/plugins/user'

export function createAPI(context: Context) {
  return Client.create(context, { form, entity, schema, translation, unit })
}

export interface IAPIClient {
  (api: Client): Object
}

export class Client {
  public build: string
  public version: string
  public baseURL: string
  public baseFormURL: string
  // public sentry: any
  public _context: Context

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
    this.baseURL = `${context.$config.apiUrl}`.replace(/\/$/, '')
    this.baseFormURL = `${context.$config.formsApiUrl}`.replace(/\/$/, '')
    // this.sentry = context.app.$sentry
    this._context = context
  }

  public getURL(url: string) {
    const _url = String(url).replace(/^\/api\/forms/, this.baseFormURL).replace(/^\/api/, this.baseURL)
    if (_url.startsWith('/')) {
      const loc = window.location
      return `${loc.protocol}//${loc.host}${_url}`
    }
    return _url
  }

  public async req(url: string, options: RequestOptions & { method: 'DELETE' }): Promise<any>
  public async req<T = any>(url: string, options?: RequestOptions): Promise<T>

  /**
   * Basic request function used by all api namespaces
   */
  public async req(url: string, options: RequestOptions = {}) {
    const $user = this.context.app.$user as User

    const defaults = {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + $user.auth.token,
        'x-client-build': this.build,
        'x-client-version': this.version
      } as Record<string, string>,
      method: 'GET',
      mode: 'cors'
    }

    if (options.json) {
      if ('$etag' in options.json) {
        defaults.headers['If-Match'] = options.json.$etag?.replace(/^W\/"|"$/gi, '')
      }
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
    let status = 0
    try {
      const reqURL = this.getURL(combinedUrl)
      const res = await fetch(reqURL, combinedOptions)
      status = res.status
      if (Number(res.status) === 401) {
        /* if (options.retry) {
          if (await $user.refreshSession()) {
            return this.req(url, { ...options, retry: false })
          }
        } */
        await $user.auth.logout('/')
        return Promise.reject(new Error(`Invalid JWT: ${combinedOptions.method || 'GET'} ${reqURL}`))
      } else if (options.method === 'DELETE') {
        return Promise.resolve()
      } else {
        return await this.parseResponse(reqURL, res)
      }
    } catch (e) {
      // this.sentry.setTag('error_level', 'warning')
      // this.sentry.captureException(e)
      return Promise.reject(Object.assign(e, { status }))
    }
  }

  async parseResponse<T>(url: string, res: Response): Promise<T & { $etag?: string }> {
    const raw = await res.text()

    const etag = res.headers.get('etag')

    let parsed
    try {
      parsed = raw ? JSON.parse(raw) : true
      if (typeof parsed === 'object' && etag) {
        Object.defineProperty(parsed, '$etag', { enumerable: false, configurable: false, value: etag })
      }
    } catch (e) {
      throw new VeoError('Non JSON response')
    }
    if (parsed) {
      if (res.status >= 200 && res.status <= 300) {
        return parsed
      } else if (parsed.code) {
        throw new VeoError(parsed.code, VeoErrorTypes.VEO_ERROR_COMMON)
      } else {
        const e = new Error(`Error ${res.status || '?'} while accessing ${url}: ${parsed.name}`)
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

export default (function (context, inject) {
  inject('api', createAPI(context))
} as Plugin)

export type Injection = ReturnType<typeof createAPI>
export type API = Injection
