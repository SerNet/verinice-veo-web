import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    /**
     * Loads all Procces
     * @param parent
     */
    fetchAll(params?: Record<string, string>) {
      return api.req('/api/processes', {
        params
      })
    },

    /**
     * Creates a Process
     * @param process
     */
    create(process: Object) {
      return api.req('/api/processes', {
        json: process
      })
    },

    /**
     * Loads a Process by id
     * @param id
     */
    fetch(id: string) {
      return api.req(`/api/processes/${id}`)
    },

    /**
     * Updates a process
     * @param id
     * @param process
     */
    update(id: string, process: Object) {
      return api.req(`/api/processes/${id}`, {
        method: 'PUT',
        json: process
      })
    },

    /**
     * Deletes a process
     * @param id
     */
    delete(id: string) {
      return api.req(`/api/processes/${id}`, {
        method: 'DELETE'
      })
    }
  }
}
