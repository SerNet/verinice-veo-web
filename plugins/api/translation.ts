import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    fetch() {
      return api.req('/api/translations')
    }
  }
}
