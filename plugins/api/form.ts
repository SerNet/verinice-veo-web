import { Client } from '~/plugins/api'
import { FormSchema, FormSchemaMetas } from '~/types/FormSchema'

export default function(api: Client) {
  return {
    /**
     * Loads all Forms
     * @param parent
     */
    fetchAll(parent?: string): Promise<FormSchemaMetas> {
      return api.req('/api/forms', {
        params: { parent }
      })
    },

    /**
     * Creates a form
     * @param form
     */
    create(form: FormSchema) {
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
    fetch(id: string): Promise<FormSchema> {
      return api.req(`/api/forms/${id}`)
    },

    /**
     * Updates a form
     * @param id
     * @param form
     */
    update(id: string, form: FormSchema) {
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
