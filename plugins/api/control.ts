import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    /**
     * Loads all Controls
     * @param parent
     */
    fetchAll(parent?: string) {
      return api.req('/api/controls', {
        params: { parent }
      })
    },

    /**
     * Creates a control
     * @param control
     */
    create(control: Object) {
      api.req('/api/controls', {
        json: control
      })
    },

    /**
     * Loads a controll by id
     * @param id
     */
    fetch(id: string) {
      return api.req(`/api/controls/${id}`)
    },

    /**
     * Updates a control
     * @param id
     * @param control
     */
    update(id: string, control: Object) {
      return api.req(`/api/controls/${id}`, {
        method: 'PUT',
        json: control
      })
    },

    /**
     * Deletes a control
     * @param id
     */
    delete(id: string) {
      return api.req(`/api/control/${id}`, {
        method: 'DELETE'
      })
    }
  }
}
