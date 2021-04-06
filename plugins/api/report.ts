import { Client } from '~/plugins/api'
import { IVeoReportsMeta } from '~/types/VeoTypes'

export default function (api: Client) {
  return {
    /**
     * Loads all Forms
     * @param parent
     */
    fetchAll(params?: Record<string, string>): Promise<IVeoReportsMeta> {
      return api.req('/api/reports', {
        params
      })
    },

    /**
     * Creates a report
     * @param form
     * 
     * @returns UUID of the new form
     */
    create(type: string): Promise<string> {
      return api.req(`/api/reports/${type}`, {
        method: 'POST'
      })
    }
  }
}
