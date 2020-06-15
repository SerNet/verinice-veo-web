import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    /**
     * Retrieves a map of UI translation key-value pairs.
     */
    fetch() {
      return api.req('/api/translations')
    }
  }
}
