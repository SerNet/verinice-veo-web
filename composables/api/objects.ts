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
import { IVeoPaginationOptions } from '~~/types/VeoTypes';
import { QueryOptions, useQuery } from './utils/query';
import objectQueryDefinitions from './queryDefinitions/objects';

export interface IVeoFetchParentObjectsParameters extends IVeoPaginationOptions {
  parentEndpoint: string;
  childObjectId: string;
  unitId: string;
}

export const useFetchParentObjects = (queryParameters: Ref<IVeoFetchParentObjectsParameters>, queryOptions?: QueryOptions) => {
  const transformedQueryParameters = computed(() => ({
    ...omit(queryParameters.value, 'unitId', 'parentEndpoint', 'childObjectId'),
    unit: queryParameters.value.unitId,
    endpoint: queryParameters.value.parentEndpoint,
    childElementIds: queryParameters.value.childObjectId,
    size: -1
  }));
  return useQuery(objectQueryDefinitions.queries.fetchAll, transformedQueryParameters, queryOptions);
};
