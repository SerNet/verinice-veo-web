/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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
import { Ref } from 'vue';

import { IVeoQueryTransformationMap, QueryOptions, useQuery } from './utils/query';

export interface IVeoDeploymentInformation {
  build: {
    artifact?: string;
    ci: {
      jobname?: string;
      buildnumber?: string;
    };
    group?: string;
    name?: string;
    time?: string;
    version?: string;
  };
  git: {
    branch?: string;
    commit?: {
      id?: string;
      time?: string;
    };
  };
}

export interface IVeoFetchDeploymentDetailsParameters {
  api: 'default' | 'forms' | 'history' | 'reporting' | 'accounts';
}

export const monitoringQueryParameterTransformationMap: IVeoQueryTransformationMap = {
  fetch: (queryParameters: IVeoFetchDeploymentDetailsParameters) => ({ params: queryParameters })
};

export const useFetchDeploymentDetails = (queryParameters: Ref<IVeoFetchDeploymentDetailsParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchDeploymentDetailsParameters, IVeoDeploymentInformation>('monitoring', { url: '/api/:api/actuator/info' }, queryParameters, monitoringQueryParameterTransformationMap.fetch, queryOptions);
