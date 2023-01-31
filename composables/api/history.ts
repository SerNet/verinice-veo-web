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
import { IVeoQueryTransformationMap, QueryOptions, STALE_TIME, useQuery } from './utils/query';
import { useFetchSchemas } from './schemas';
import { IVeoEntity, IVeoObjectHistoryEntry } from '~/types/VeoTypes';

export interface IVeoFetchVersionsParameters {
  object: IVeoEntity;
  endpoint?: string; // Set by useFetchVersions
}

export interface IVeoFetchLatestChangesParameters {
  unitId: string;
}

export const historyQueryParameterTransformationMap: IVeoQueryTransformationMap = {
  fetchAll: (queryParameters: IVeoFetchVersionsParameters) => ({ query: { uri: `/${queryParameters.endpoint}/${queryParameters.object.id}` } }),
  fetchLatest: (queryParameters: IVeoFetchLatestChangesParameters) => ({ query: { owner: `/units/${queryParameters.unitId}` } })
};

export const useFetchVersions = (queryParameters: Ref<IVeoFetchVersionsParameters>, queryOptions?: QueryOptions) => {
  const { data: endpoints } = useFetchSchemas();

  const endpoint = computed(() => endpoints.value?.[queryParameters.value.object.type]);
  const queryEnabled = computed(() => (!!endpoint.value && queryOptions?.enabled ? unref(queryOptions?.enabled) : true));

  const combinedQueryParameters = computed(() => ({ ...queryParameters.value, endpoint: endpoint.value }));

  return useQuery<IVeoFetchVersionsParameters, IVeoObjectHistoryEntry[]>(
    'versions',
    {
      url: '/api/history/revisions'
    },
    combinedQueryParameters,
    historyQueryParameterTransformationMap.fetchAll,
    { ...queryOptions, staleTime: STALE_TIME.INFINITY, enabled: queryEnabled }
  );
};

export const useFetchLatestChanges = (queryParameters: Ref<IVeoFetchLatestChangesParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchLatestChangesParameters, IVeoObjectHistoryEntry[]>(
    'latestVersions',
    { url: '/api/history/revisions/my-latest' },
    queryParameters,
    historyQueryParameterTransformationMap.fetchLatest,
    { ...queryOptions, staleTime: STALE_TIME.REQUEST }
  );
