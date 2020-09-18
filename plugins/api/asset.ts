import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    /**
     * Load all assets
     * @param parent
     */
    fetchAll(params?: Record<string, string>) {
      return api.req('/api/assets', {
        params
      })
    },

    /**
     * Creates an asset
     * @param asset
     */
    create(asset: Object) {
      return api.req('/api/assets', {
        json: asset
      })
    },

    /**
      * Load an asset
      * @param id
      */
    fetch(id: string) {
      return api.req(`/api/assets/${id}`)
    },

    /**
     * Updates an asset
     * @param id
     * @param asset
     */
    update(id: string, asset: Object) {
      return api.req(`/api/assets/${id}`, {
        method: 'PUT',
        json: asset
      })
    },

    /**
     * Deletes an asset
     * @param id
     */
    delete(id: string) {
      return api.req(`/api/assets/${id}`, {
        method: 'DELETE'
      })
    }
  }
}
