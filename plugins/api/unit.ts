import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    /**
     * Loads all Units
     * @param parent
     */
    fetchAll(parent?: string) {
      return api.req('/api/units', {
        params: { parent }
      })
    },

    /**
     * Creates a Unit
     * @param unit
     */
    create(unit: Object) {
      return api.req('/api/units', {
        json: unit
      })
    },

    /**
     * Loads an Unit
     * @param id
     */
    fetch(id: string) {
      return api.req(`/api/units/${id}`)
    },

    /**
     * Updates a Unit
     * @param id
     * @param unit
     */
    update(id: string, unit: Object) {
      return api.req(`/api/units/${id}`, {
        method: 'PUT',
        json: unit
      })
    },

    /**
     * Deletes a Unit
     * @param id
     */
    delete(id: string) {
      return api.req(`/api/units/${id}`, {
        method: 'DELETE'
      })
    }
  }
}