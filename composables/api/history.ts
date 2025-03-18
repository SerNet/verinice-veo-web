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
import { QueryOptions, useQuery } from './utils/query';
import historyQueryDefinitions from './queryDefinitions/history';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

export interface IVeoFetchVersionsParameters {
  id: string;
  objectType: string;
  domainId: string;
}

export const useFetchVersions = (queryParameters: Ref<IVeoFetchVersionsParameters>, queryOptions?: QueryOptions) => {
  const endpoint = computed(() => VeoElementTypePlurals[queryParameters.value.objectType]);
  const queryEnabled = computed(() =>
    // @ts-ignore TODO #3066 not assignable
    !!endpoint.value && queryOptions?.enabled ? unref(queryOptions?.enabled) : true
  );

  const combinedQueryParameters = computed(() => ({
    domainId: queryParameters.value.domainId,
    id: queryParameters.value.id,
    endpoint: endpoint.value as string
  }));

  return useQuery(historyQueryDefinitions.queries.fetchVersions, combinedQueryParameters, {
    ...queryOptions,
    enabled: queryEnabled
  });
};
