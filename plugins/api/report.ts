import { Client, VeoApiReponseType } from '~/plugins/api';
import { IVeoCreateReportData, IVeoReportsMeta } from '~/types/VeoTypes';

export default function (api: Client) {
  return {
    /**
     * Loads all reports
     */
    fetchAll(params?: Record<string, string>): Promise<IVeoReportsMeta> {
      return api.req('/api/reports', {
        params
      });
    },

    /**
     * Creates a report
     * @param type
     *
     * @returns UUID of the new form
     */
    create(type: string, body: IVeoCreateReportData): Promise<string> {
      return api.req(`/api/reports/${type}`, {
        method: 'POST',
        json: body,
        reponseType: VeoApiReponseType.BLOB
      });
    }
  };
}
