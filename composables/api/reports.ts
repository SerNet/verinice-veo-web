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
import { useContext } from '@nuxtjs/composition-api';
import { MaybeRef } from '@tanstack/vue-query/build/lib/types';

import { QueryOptions, STALE_TIME, useQuery } from './utils/query';
import { MutationOptions, useMutation } from './utils/mutation';
import { IVeoCreateReportData, IVeoReportsMeta } from '~/types/VeoTypes';

export interface IVeoCreateReportParameters {
  type: string;
  body: IVeoCreateReportData;
}

export const reportsQueryKeys = {
  reports: ['reports'] as const
};

export const useFetchReports = (queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoReportsMeta>(reportsQueryKeys.reports, $api.report.fetchAll, {}, { ...queryOptions, staleTime: STALE_TIME.INFINITY });
};

export const useCreateReport = (mutationParameters: MaybeRef<IVeoCreateReportParameters>, mutationOptions?: MutationOptions) => {
  const { $api } = useContext();

  // No need to invalidate queries, as this doesn't create a new report type, just a new report of that type for the user
  return useMutation('report', $api.report.create, mutationParameters, mutationOptions);
};
