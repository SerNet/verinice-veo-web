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
import { computed, unref, useContext } from '@nuxtjs/composition-api';
import { MaybeRef } from '@tanstack/vue-query/build/lib/types';

import { QueryOptions, STALE_TIME, useQueries, useQuery } from './utils/query';
import { IVeoObjectSchema } from '~/types/VeoTypes';
import { IVeoSchemaEndpoints } from '~/plugins/api/schema';
import { IBaseObject } from '~/lib/utils';

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

export const useFetchSchemas = (queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoSchemaEndpoints>(schemasQueryKeys.schemas, $api.schema.fetchAll, {}, { ...queryOptions, staleTime: STALE_TIME.INFINITY, placeholderData: {} });
};

export const useFetchSchema = (queryParameters: MaybeRef<IVeoFetchSchemaParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoObjectSchema>(schemasQueryKeys.schema, $api.schema.fetch, queryParameters, { ...queryOptions, staleTime: STALE_TIME.MEDIUM });
};

export const useFetchSchemasDetailed = (queryParameters: MaybeRef<IVeoFetchSchemasDetailedParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  // Query useQueries depends on
  const { data: schemas } = useFetchSchemas();

  // Parameters for the depending queries. As this function only gets called once, we have to add reactivity under the hood to make the magic happen
  const dependetQueryKeys = computed<(readonly string[] | CallableFunction)[]>(() => Object.keys(schemas.value || {}).map((_) => schemasQueryKeys.schema));
  const dependentQueryParameters = computed<IBaseObject[]>(() =>
    Object.keys(schemas.value || {}).map((schemaName) => ({ domainIds: unref(queryParameters).domainIds, type: schemaName }))
  );

  return useQueries<IVeoObjectSchema>(dependetQueryKeys, $api.schema.fetch, dependentQueryParameters, queryOptions);
};
