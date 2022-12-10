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
import { computed, Ref, unref } from '@nuxtjs/composition-api';
import { MaybeRef } from '@tanstack/vue-query/build/lib/types';

import { IVeoQueryTransformationMap, QueryOptions, STALE_TIME, useQueries, useQuery } from './utils/query';
import { IVeoObjectSchema } from '~/types/VeoTypes';
import { IVeoEntitiesMetaInfo, IVeoSchemaEndpoints } from '~/plugins/api/schema';

export interface IVeoFetchSchemaParameters {
  type: string;
  domainIds: string[];
}

export interface IVeoFetchSchemasDetailedParameters {
  domainIds: string[];
}

export const schemasQueryKeys = {
  schemas: ['schemas'] as const,
  schema: (queryParameters: IVeoFetchSchemaParameters) => ['schema', queryParameters.type, queryParameters.domainIds] as const
};

export const schemasQueryParameterTransformationMap: IVeoQueryTransformationMap = {
  fetchAll: () => ({}),
  fetch: (queryParameters: IVeoFetchSchemaParameters) => ({ params: { type: queryParameters.type }, query: { domains: (queryParameters.domainIds || []).toString() } })
};

export const useFetchSchemas = (queryOptions?: QueryOptions) =>
  useQuery<void, IVeoSchemaEndpoints>(
    'schemas',
    {
      url: '/api/types',
      onDataFetched: (result: any) =>
        Object.fromEntries(Object.entries(result as IVeoEntitiesMetaInfo).map(([key, value]) => [key, /([a-z]*){(.+)$/.exec(value.collectionUri)?.[1] || value.collectionUri]))
    },
    undefined,
    schemasQueryParameterTransformationMap.fetchAll,
    { ...queryOptions, staleTime: STALE_TIME.INFINITY, placeholderData: {} }
  );

export const useFetchSchema = (queryParameters: Ref<IVeoFetchSchemaParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchSchemaParameters, IVeoObjectSchema>(
    'schema',
    {
      url: '/api/schemas/:type'
    },
    queryParameters,
    schemasQueryParameterTransformationMap.fetch,
    { ...queryOptions, staleTime: STALE_TIME.MEDIUM }
  );

export const useFetchSchemasDetailed = (queryParameters: MaybeRef<IVeoFetchSchemasDetailedParameters>, queryOptions?: QueryOptions) => {
  // Query useQueries depends on
  const { data: schemas } = useFetchSchemas();

  // Parameters for the depending queries. As this function only gets called once, we have to add reactivity under the hood to make the magic happen
  const dependentQueryParameters = computed(() => Object.keys(schemas.value || {}).map((schemaName) => ({ domainIds: unref(queryParameters).domainIds, type: schemaName })));

  return useQueries<IVeoFetchSchemaParameters, IVeoObjectSchema>(
    'schemas_detailed',
    {
      url: '/api/schemas/:type'
    },
    dependentQueryParameters,
    schemasQueryParameterTransformationMap.fetch,
    queryOptions
  );
};
