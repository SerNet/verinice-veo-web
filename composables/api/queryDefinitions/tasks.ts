/*
 * verinice.veo web
 * Copyright (C) 2026 Aziz Khalledi
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
import type { IVeoPaginatedResponse } from '~/types/VeoTypes';
import type { IVeoTask } from '~/types/VeoTask';
import type { IVeoQueryDefinition } from '../utils/query';
import { STALE_TIME } from '../utils/query';

export interface IVeoFetchTasksParameters {
  domainId: string;
  unit: string;
  page?: number;
  size?: number;
}

export default {
  queries: {
    fetchAll: {
      primaryQueryKey: 'tasks',
      url: '/api/domains/:domainId/tasks',
      queryParameterTransformationFn: (queryParameters) => ({
        params: {
          domainId: queryParameters.domainId
        },
        query: {
          unit: queryParameters.unit,
          page: queryParameters.page ?? 0,
          size: queryParameters.size ?? 10
        }
      }),
      staticQueryOptions: {
        staleTime: STALE_TIME.MEDIUM,
        // Keep the current page visible while the next one is loading
        keepPreviousData: true
      }
    } as IVeoQueryDefinition<IVeoFetchTasksParameters, IVeoPaginatedResponse<IVeoTask[]>>
  },
  mutations: {}
};
