import { Client } from '~/plugins/api'

import { IVeoAPIMessage, IVeoScope } from '~/types/VeoTypes'

export default function(api: Client) {
  return {
    /**
     * Loads all Units
     * @param parent
     */
    fetchAll(params?: Record<string, string>): Promise<IVeoScope[]> {
      return api.req('/api/scopes', {
        params
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
      return api.req(`/api/scopes/${id}`)
    },

    /**
     * Updates a Unit
     * @param id
     * @param unit
     */
    update(id: string, unit: Object): Promise<IVeoScope> {
      return api.req(`/api/scopes/${id}`, {
        method: 'PUT',
        json: unit
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
    }
  }
}
