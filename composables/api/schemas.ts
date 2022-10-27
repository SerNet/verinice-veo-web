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
import { UseQueryOptions } from '@tanstack/vue-query/build/lib';
import { MaybeRef } from '@tanstack/vue-query/build/lib/types';

import { useQuery } from './utils/query';
import { IVeoObjectSchema } from '~/types/VeoTypes';
import { IVeoSchemaEndpoint } from '~/plugins/api/schema';

export interface IVeoFetchSchemaParameters {
  type: string;
  domainIds: string[];
}

export const schemasQueryKeys = {
  schemas: ['schemas'],
  schema: (queryParameters: IVeoFetchSchemaParameters) => ['schema', queryParameters.type, queryParameters.domainIds] as const
};

export const useFetchSchemas = (queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) => {
  const { $api } = useContext();

  return useQuery<IVeoSchemaEndpoint[]>(schemasQueryKeys.schemas, $api.schema.fetchAll, {}, { ...queryOptions, staleTime: Infinity, placeholderData: [] });
};

export const useFetchSchema = (queryParameters: MaybeRef<IVeoFetchSchemaParameters>, queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) => {
  const { $api } = useContext();

  return useQuery<IVeoObjectSchema>(schemasQueryKeys.schema, $api.schema.fetch, queryParameters, { ...queryOptions, staleTime: 10 * 60 * 1000 });
};
