/*
 * verinice.veo web
 * Copyright (C) 2024 Aziz Khalledi
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
import type { IVeoQueryDefinition } from '../utils/query';
import { STALE_TIME } from '../utils/query';

export interface IFeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFetchFeatureFlagsParameters {
  domainId?: string;
}

export default {
  queries: {
    fetchFeatureFlags: {
      primaryQueryKey: 'featureFlags',
      url: '/api/domains/:domainId/feature-flags',
      queryParameterTransformationFn: (queryParameters) => ({
        query: {
          domain: queryParameters.domainId
        }
      }),
      staticQueryOptions: {
        staleTime: STALE_TIME.INFINITY,
        placeholderData: {}
      }
    } as IVeoQueryDefinition<IFetchFeatureFlagsParameters, IFeatureFlag[]>
  },
  mutations: {}
};
