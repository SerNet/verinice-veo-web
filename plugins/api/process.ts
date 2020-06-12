import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    fetchAll(parent?: string) {
      return api.req('/api/processes')
    },
    fetchByUuid(uuid: string) {
      return api.req(`/api/processes/${uuid}`)
    }
  }
}
