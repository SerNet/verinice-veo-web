import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    /**
     * Loads all Forms
     * @param parent
     */
    fetchAll(parent?: string) {
      return api.req('/api/forms', {
        params: { parent }
      })
    },

    /**
     * Creates a form
     * @param form
     */
    create(form: Object) {
      return api.req('/api/forms', {
        json: form
      })
    },
    /* form = {
      "name": "string",
      "modelType": "Asset",
      "content": {}
    } */

    /**
     * Loads a forml by id
     * @param id
     */
    fetch(id: string) {
      return api.req(`/api/forms/${id}`)
    },

    /**
     * Updates a form
     * @param id
     * @param form
     */
    update(id: string, form: Object) {
      return api.req(`/api/forms/${id}`, {
        method: 'PUT',
        json: form
      })
    },

    /**
     * Deletes a form
     * @param id
     */
    delete(id: string) {
      return api.req(`/api/forms/${id}`, {
        method: 'DELETE'
      })
    }
  }
}
