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
import { IVeoQueryTransformationMap, QueryOptions, STALE_TIME, useQuery } from './utils/query';
import { IVeoMutationTransformationMap, MutationOptions, useMutation } from './utils/mutation';
import { VeoApiReponseType } from './utils/request';
import { IVeoCreateReportData, IVeoReportsMeta } from '~/types/VeoTypes';

export interface IVeoCreateReportParameters {
  type: string;
  body: IVeoCreateReportData;
}

export const reportsQueryParameterTransformationMap: IVeoQueryTransformationMap = {
  fetchAll: () => ({})
};

export const reportsMutationParameterTransformationMap: IVeoMutationTransformationMap = {
  create: (mutationParameters: IVeoCreateReportParameters) => ({ json: mutationParameters.body, params: { type: mutationParameters.type } })
};

export const useFetchReports = (queryOptions?: QueryOptions) =>
  useQuery<void, IVeoReportsMeta>(
    'reports',
    {
      url: '/api/reporting/reports'
    },
    undefined,
    reportsQueryParameterTransformationMap.fetchAll,
    { ...queryOptions, staleTime: STALE_TIME.INFINITY }
  );

export const useCreateReport = (mutationOptions?: MutationOptions) =>
  useMutation<IVeoCreateReportParameters, void>(
    'report',
    {
      url: '/api/reporting/reports/:type',
      method: 'POST',
      reponseType: VeoApiReponseType.BLOB
    },
    reportsMutationParameterTransformationMap.create,
    // No need to invalidate queries, as this doesn't create a new report type, just a new report of that type for the user
    mutationOptions
  );
