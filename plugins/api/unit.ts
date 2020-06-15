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
      api.req('/api/units', {
        json: unit
      })
    },

    /**
     * Loads an Unit by ID
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
    // update() {},

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
