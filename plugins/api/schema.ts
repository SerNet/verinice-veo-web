import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    fetchAll() {
      return api.req('/api/schemas')
    },
    fetchByType(type: string) {
      return api.req(`/api/schemas/${type}`)
    }
  }
}
