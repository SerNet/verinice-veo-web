import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    /**
     * Load all assets
     * @param parent
     */
    fetchAll(parent?: string) {
      return api.req('/api/assets')
    },
    /**
     * Creates an asset
     * @param body
     */
    create(asset: Object) {},
    /**
      * Load an asset
      * @param id
      */
    fetchByUuid(uuid: string) {
      return api.req(`/api/assets/${uuid}`)
    },
    /**
     * Updates an asset
     */
    update(uuid: string) {
      return api.req(`/api/assets/${uuid}`)
    },
    /**
     * Deletes an asset
     */
    delete(uuid: string) {
      return api.req(`/api/assets/${uuid}`)
    }
  }
}
