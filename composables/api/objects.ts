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
import { UseQueryOptions } from 'vue-query/lib/vue';
import { MaybeRef } from 'vue-query/lib/vue/types';

import { useQuery } from './utils/query';
import { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

interface IVeoFetchObjectsParameters {
  unit: string;
  objectType: string;
  page?: number;
  displayName?: string;
  subType?: string;
  childElementIds?: string;
}

interface IVeoFetchObjectParameters {
  objectType: string;
  id: string;
}

/**
 * Loads all objects up to a limit.
 *
 * @param queryParameters The parameters required by the api call.
 * @param queryOptions Options modifying query behaviour.
 * @returns Returns all objects matching the parameter criteria.
 */
export const useFetchObjects = (queryParameters: MaybeRef<IVeoFetchObjectsParameters>, queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) => {
  const { $api } = useContext();

  return useQuery<IVeoPaginatedResponse<IVeoEntity[]>>('objects', $api.entity.fetchAll, queryParameters, queryOptions);
};

export const useFetchObject = (queryParameters: MaybeRef<IVeoFetchObjectParameters>, queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) => {
  const { $api } = useContext();

  return useQuery<IVeoEntity>('object', $api.entity.fetch, queryParameters, queryOptions);
};
