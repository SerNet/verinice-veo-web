/*
 * verinice.veo web
 * Copyright (C) 2023  Jonas Heitmann
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
import type { IVeoMutationDefinition } from '../utils/mutation';
import type { IVeoQueryDefinition } from '../utils/query';
import { STALE_TIME } from '../utils/query';
import { VeoApiResponseType } from '../utils/request';

export interface IVeoReportMeta {
  name: {
    [key: string]: string;
  };
  description: {
    [key: string]: string;
  };
  outputTypes: string[];
  multipleTargetsSupported: boolean;
  targetTypes: {
    modelType: string;
    subTypes?: string[] | null;
  }[];
}

export interface IVeoReportsMeta {
  [key: string]: IVeoReportMeta;
}

export interface IVeoCreateReportParameters {
  type: string;
  body: {
    outputType: string;
    timeZone: string;
    targets: {
      type: string;
      id: string;
    }[];
  };
}

export interface IVeoFetchReportsParameters {
  domain: string;
}

export default {
  queries: {
    fetchAll: {
      primaryQueryKey: 'reports',
      url: '/api/reporting/reports',
      queryParameterTransformationFn: (queryParameters) => ({
        query: queryParameters
      }),
      staticQueryOptions: {
        staleTime: STALE_TIME.INFINITY
      }
    } as IVeoQueryDefinition<IVeoFetchReportsParameters, IVeoReportsMeta>
  },
  mutations: {
    create: {
      primaryQueryKey: 'report',
      url: '/api/reporting/reports/:type',
      method: 'POST',
      responseType: VeoApiResponseType.BLOB,
      mutationParameterTransformationFn: (mutationParameters) => ({
        json: mutationParameters.body,
        params: { type: mutationParameters.type }
      }),
      staticMutationOptions: {
        onSuccess() {
          // No need to invalidate queries, as this doesn't create a new report type, just a new report of that type for the user
        }
      }
    } as IVeoMutationDefinition<IVeoCreateReportParameters, void>
  }
};
