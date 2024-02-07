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
import { max, omit } from 'lodash';
import { Ref } from 'vue';
import { IVeoPaginationOptions } from '~/types/VeoTypes';
import { QueryOptions, useQuery } from './utils/query';
import objectQueryDefinitions, { IVeoFetchObjectsParameters } from './queryDefinitions/objects';

export interface IVeoFetchParentObjectsParameters extends IVeoPaginationOptions {
  parentEndpoint: string;
  childObjectId: string;
  unitId: string;
}

export const useFetchObjects = (queryParameters: Ref<IVeoFetchObjectsParameters>, queryOptions?: QueryOptions) => {
  const { tablePageSize } = useVeoUser();

  // tablePageSize is possibly -1
  // if so, we assign a default value to not send invalid queries with `?size="-1"`
  const _tablePageSize = tablePageSize?.value === -1 ? 1000 : tablePageSize.value;

  const transformedQueryParameters = computed(() => ({
    ...queryParameters.value,
    size:
      queryParameters.value.size === undefined ? _tablePageSize
      : queryParameters.value.size === -1 ? 1000
      : queryParameters.value.size,
    page: queryParameters.value.page ? max([queryParameters.value.page - 1, 0]) : 0
  }));
  return useQuery(objectQueryDefinitions.queries.fetchAll, transformedQueryParameters, queryOptions);
};

export const useFetchParentObjects = (
  queryParameters: Ref<IVeoFetchParentObjectsParameters>,
  queryOptions?: QueryOptions
) => {
  const { tablePageSize } = useVeoUser();

  // tablePageSize is possibly -1
  // if so, we assign a default value to not send invalid queries with `?size="-1"`
  const _tablePageSize = tablePageSize?.value === -1 ? 1000 : tablePageSize.value;

  const transformedQueryParameters = computed(() => ({
    ...omit(queryParameters.value, 'unitId', 'parentEndpoint', 'childObjectId'),
    unit: queryParameters.value.unitId,
    endpoint: queryParameters.value.parentEndpoint,
    childElementIds: queryParameters.value.childObjectId,
    size:
      queryParameters.value.size === undefined ? _tablePageSize
      : queryParameters.value.size === -1 ? 1000
      : queryParameters.value.size,
    page: queryParameters.value.page ? max([queryParameters.value.page - 1, 0]) : 0
  }));
  return useQuery(objectQueryDefinitions.queries.fetchAll, transformedQueryParameters, queryOptions);
};
