import { Client } from '~/plugins/api'

import { IVeoUnit } from '~/types/VeoUnits'

export default function(api: Client) {
  return {
    /**
     * Loads all Units
     * @param parent
     */
    fetchAll(params?: Record<string, string>): Promise<IVeoUnit[]> {
      return api.req('/api/scopes', {
        params
      })
    },

    /**
     * Creates a Unit
     * @param unit
     */
    create(unit: Object) {
      return api.req('/api/scopes', {
        method: 'POST',
        json: unit
      })
    },

    /**
     * Loads an Unit
     * @param id
     */
    fetch(id: string): Promise<IVeoUnit> {
      return api.req(`/api/scopes/${id}`)
    },

    /**
     * Updates a Unit
     * @param id
     * @param unit
     */
    update(id: string, unit: Object) {
      return api.req(`/api/scopes/${id}`, {
        method: 'PUT',
        json: unit
      })
    },

    /**
     * Deletes a Unit
     * @param id
     */
    delete(id: string) {
      return api.req(`/api/scopes/${id}`, {
        method: 'DELETE'
      })
    }
  }
}
