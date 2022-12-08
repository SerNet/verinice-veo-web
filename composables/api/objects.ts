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

import { QueryOptions, useQuery } from './utils/query';
import { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

export interface IVeoFetchObjectsParameters {
  unit: string;
  endpoint: string;
  page?: number;
  displayName?: string;
  subType?: string;
  childElementIds?: string;
}

export interface IVeoFetchObjectParameters {
  endpoint: string;
  id: string;
}

export const objectsQueryKeys = {
  objects: (queryParameters: IVeoFetchObjectsParameters) => ['objects', queryParameters.endpoint, queryParameters.page || 1, queryParameters] as const,
  object: (queryParameters: IVeoFetchObjectParameters) => ['object', queryParameters.endpoint, queryParameters.id]
};

/**
 * Loads all objects up to a limit.
 *
 * @param queryParameters The parameters required by the api call.
 * @param queryOptions Options modifying query behaviour.
 * @returns Returns all objects matching the parameter criteria.
 */
export const useFetchObjects = (queryParameters: MaybeRef<IVeoFetchObjectsParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoPaginatedResponse<IVeoEntity[]>>(objectsQueryKeys.objects, $api.entity.fetchAll, queryParameters, queryOptions);
};

/**
 * Loads a single object, including object details
 *
 * @param queryParameters The parameters required by the api call.
 * @param queryOptions Options modifying query behaviour.
 * @returns Returns the object.
 */
export const useFetchObject = (queryParameters: MaybeRef<IVeoFetchObjectParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoEntity>(objectsQueryKeys.object, $api.entity.fetch, queryParameters, queryOptions);
};
