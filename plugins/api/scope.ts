import { Client } from '~/plugins/api'

import { IVeoAPIMessage, IVeoScope } from '~/types/VeoTypes'

export default function (api: Client) {
  return {
    /**
     * Loads all Units
     * @param parent
     */
    fetchAll(params?: Record<string, string>): Promise<IVeoScope[]> {
      return api.req('/api/scopes', {
        params
      }).then((result: IVeoScope[]) => {
        result.forEach((entry: IVeoScope) => {
          Object.defineProperty(entry, '$type', { enumerable: false, configurable: false, value: 'scope' })
        })
        return result
      })
    },

    /**
     * Creates a Unit
     * @param unit
     */
    create(unit: Object): Promise<IVeoAPIMessage> {
      return api.req('/api/scopes', {
        method: 'POST',
        json: unit
      })
    },

    /**
     * Loads an Unit
     * @param id
     */
    fetch(id: string): Promise<IVeoScope> {
      return api.req(`/api/scopes/${id}`).then((result: IVeoScope) => {
        Object.defineProperty(result, '$type', { enumerable: false, configurable: false, value: 'scope' })
        return result
      })
    },

    /**
     * Updates a Unit
     * @param id
     * @param unit
     */
    update(id: string, scope: IVeoScope): Promise<IVeoScope> {
      return api.req(`/api/scopes/${id}`, {
        method: 'PUT',
        json: scope
      }).then((result: IVeoScope) => {
        Object.defineProperty(result, '$type', { enumerable: false, configurable: false, value: 'scope' })
        return result
      })
    },

    /**
     * Deletes a Unit
     * @param id
     */
    delete(id: string): Promise<IVeoAPIMessage> {
      return api.req(`/api/scopes/${id}`, {
        method: 'DELETE'
      })
    },

    fetchScopeMembers(id: string): Promise<IVeoScope[]> {
      return api.req(`/api/scopes/${id}/members`).then((result: IVeoScope[]) => {
        result.forEach((entry: IVeoScope) => {
          Object.defineProperty(entry, '$type', { enumerable: false, configurable: false, value: 'scope' })
        })
        return result
      })
    }
  }
}
