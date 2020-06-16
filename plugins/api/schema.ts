import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    /**
     * Returns a list of all available entity schemas.
     */
    fetchAll() {
      return api.req('/api/schemas')
    },

    /**
     * Retrieves an entity schema.
     * @param type
     */
    fetch(type: string) {
      return api.req(`/api/schemas/${type}?domains=GDPR%2CISO_27001`)
    }
  }
}
