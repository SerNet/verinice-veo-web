/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { Client, VeoApiReponseType } from '~/plugins/api';
import { IVeoCreateReportData, IVeoReportsMeta } from '~/types/VeoTypes';

export default function (api: Client) {
  return {
    /**
     * Loads all reports
     *
     * NOT PAGINATED
     *
     */
    fetchAll(params?: Record<string, string>): Promise<IVeoReportsMeta> {
      return api.req('/api/reports/reports', {
        params
      });
    },

    /**
     * Creates a report
     *
     * NOT PAGINATED
     *
     * @param type
     *
     * @returns UUID of the new form
     */
    create(type: string, body: IVeoCreateReportData): Promise<string> {
      return api.req(`/api/reports/reports/${type}`, {
        method: 'POST',
        json: body,
        reponseType: VeoApiReponseType.BLOB
      });
    }
  };
}
