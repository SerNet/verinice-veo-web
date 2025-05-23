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
import { QueryOptions, useQueries, useQuery } from './utils/query';

import schemaQueryDefinitions from './queryDefinitions/schemas';
import type { MaybeRef } from 'vue';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

export interface IVeoFetchSchemasDetailedParameters {
  domainId: string;
}

export const useFetchSchemasDetailed = (
  queryParameters: MaybeRef<IVeoFetchSchemasDetailedParameters>,
  queryOptions?: QueryOptions
) => {
  // Parameters for the depending queries. As this function only gets called once, we have to add reactivity under the hood to make the magic happen
  const dependentQueryParameters = computed(() =>
    Object.values(VeoElementTypePlurals).map((elementTypePlural) => ({
      domainId: unref(queryParameters).domainId,
      type: elementTypePlural
    }))
  );

  return useQueries(schemaQueryDefinitions.queries.fetchSchema, dependentQueryParameters, queryOptions);
};
