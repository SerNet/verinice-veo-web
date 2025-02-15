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
import { omit } from 'lodash';
import { Ref } from 'vue';
import { IVeoPaginationOptions } from '~/types/VeoTypes';
import objectQueryDefinitions, { IVeoFetchObjectsParameters } from './queryDefinitions/objects';
import { QueryOptions, useQuery } from './utils/query';

export interface IVeoFetchParentObjectsParameters extends IVeoPaginationOptions {
  parentEndpoint: string;
  childObjectId: string;
  unitId: string;
}

export const useFetchObjects = (queryParameters: Ref<IVeoFetchObjectsParameters>, queryOptions?: QueryOptions) => {
  const { tablePageSize } = useVeoUser();

  const transformedQueryParameters = computed(() => ({
    ...queryParameters.value,
    size: queryParameters.value.size === undefined ? tablePageSize.value : queryParameters.value.size,
    page: queryParameters.value.page ?? 0
  }));
  return useQuery(objectQueryDefinitions.queries.fetchAll, transformedQueryParameters, {
    ...queryOptions,
    placeholderData: { items: [], pageCount: 0, page: 0, totalItemCount: 0 }
  });
};

export const useFetchParentObjects = (
  queryParameters: Ref<IVeoFetchParentObjectsParameters>,
  queryOptions?: QueryOptions
) => {
  const { tablePageSize } = useVeoUser();

  const transformedQueryParameters = computed(() => ({
    ...omit(queryParameters.value, 'unitId', 'parentEndpoint', 'childObjectId'),
    unit: queryParameters.value.unitId,
    endpoint: queryParameters.value.parentEndpoint,
    childElementIds: queryParameters.value.childObjectId,
    size: queryParameters.value.size === undefined ? tablePageSize.value : queryParameters.value.size,
    page: queryParameters.value.page ?? 0
  }));
  return useQuery(objectQueryDefinitions.queries.fetchAll, transformedQueryParameters, queryOptions);
};
