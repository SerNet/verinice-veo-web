/*
 * verinice.veo web
 * Copyright (C) 2024 jae
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

import { useQuerySync } from '~/composables/api/utils/query';
import elementQueryDefinitions from '~/composables/api/queryDefinitions/elements';
import { max } from 'lodash';
import type { VeoSearch, VeoSearchQueryParameters } from '~/types/VeoSearch';
import { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

type UseSearchParams<T> = {
  baseQueryParameters: Ref<T & { endpoint?: string; page?: number }>;
  search: Ref<VeoSearch[]>;
  queryDefinition?: any;
};

type VeoSearchResponse = IVeoPaginatedResponse<IVeoEntity[]> | undefined;

function getPage(baseQueryParameters: any) {
  if (Object.hasOwn(baseQueryParameters, 'page') && typeof baseQueryParameters.page === 'number')
    return max([(baseQueryParameters.page as number) - 1, 0]);
  return 0;
}

export function useSearch<T>({ baseQueryParameters, search, queryDefinition }: UseSearchParams<T>): {
  data: Ref<VeoSearchResponse>;
  isLoading: Ref<boolean>;
} {
  const config = useRuntimeConfig();
  const data = ref<VeoSearchResponse>();
  const isLoading = ref(false);
  const _queryDefinition = queryDefinition ? queryDefinition : elementQueryDefinitions.queries.fetchAll;
  const isObjectSearch = !queryDefinition;

  async function getSearchResults() {
    watch(
      [baseQueryParameters, search],
      async () => {
        if (!search.value.length) return;
        if (isObjectSearch && !baseQueryParameters.value?.endpoint) return;
        const parameters = ref({
          ...baseQueryParameters.value,
          page: getPage(baseQueryParameters.value),
          ...getSearchQueryParameters(search.value)
        });

        try {
          isLoading.value = true;
          data.value = await useQuerySync(_queryDefinition, {
            ...parameters.value
          });
        } catch (err) {
          if (config.public.debug) console.error(err);
        } finally {
          isLoading.value = false;
        }
      },
      { deep: true }
    );
  }

  getSearchResults();

  return {
    data,
    isLoading
  };
}

function getSearchQueryParameters(search: VeoSearch[]): VeoSearchQueryParameters {
  if (!search.length) return {};
  return search.reduce(
    (queries, query) => ({
      ...queries,
      ...(query.searchFilter && query.term && query.operator == '=' ? { [query.searchFilter]: query.term } : {})
    }),
    {}
  ) as VeoSearchQueryParameters;
}
