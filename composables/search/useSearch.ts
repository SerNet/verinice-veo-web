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
import type { VeoSearch, VeoSearchQueryParameters, VeoSearchFilters } from '~/types/VeoSearch';
import type { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';
import { unref, type MaybeRef } from 'vue';
import { isEqual } from 'lodash';
import { isNavigationFailure } from 'vue-router';

type UseSearchParams<T> = {
  baseQueryParameters: Ref<T & { endpoint?: string; page?: number }>;
  search: Ref<VeoSearch[]>;
  queryDefinition?: any;
  filters?: MaybeRef<VeoSearchFilters>;
};

type VeoSearchResponse = IVeoPaginatedResponse<IVeoEntity[]> | undefined;

export function useSearch<T>({ baseQueryParameters, search, queryDefinition, filters }: UseSearchParams<T>): {
  data: Ref<VeoSearchResponse>;
  isLoading: Ref<boolean>;
} {
  const config = useRuntimeConfig();
  const data = ref<VeoSearchResponse>();
  const isLoading = ref(false);
  const _queryDefinition = queryDefinition ? queryDefinition : elementQueryDefinitions.queries.fetchAll;
  const isObjectSearch = !queryDefinition;
  const allowedKeys = computed(() => unref(filters)?.all.map((f) => f.key));

  async function getSearchResults() {
    watch(
      [baseQueryParameters, search],
      async () => {
        if (!search.value.length) return;
        if (isObjectSearch && !baseQueryParameters.value?.endpoint) return;
        const parameters = ref({
          ...baseQueryParameters.value,
          ...getSearchQueryParameters(search.value, allowedKeys.value)
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

export function getSearchQueryParameters(search: VeoSearch[], allowedKeys?: string[]): VeoSearchQueryParameters {
  const resetParameters = allowedKeys ? Object.fromEntries(allowedKeys.map((key) => [key, undefined])) : {};
  return {
    ...resetParameters,
    ...Object.fromEntries(
      search
        .filter((item) => !!item.searchFilter && (!allowedKeys || allowedKeys.includes(item.searchFilter)))
        .map((item) => [item.searchFilter as string, item.term])
    )
  };
}

export function useUrlFilters(filters: VeoSearchFilters, search: Ref<VeoSearch[]>) {
  const route = useRoute();
  const urlFilters = computed<VeoSearch[]>(() =>
    filters.all
      .map((filter) => {
        if (!route.query[filter.key]) return null;
        return {
          searchFilter: filter.key,
          operator: '=',
          term: route.query[filter.key] as string
        };
      })
      .filter(Boolean)
  );

  watch(urlFilters, () => (search.value = urlFilters.value), { immediate: true });
}

export function useUrlSearchFilters(filters: VeoSearchFilters, search: Ref<VeoSearch[]>) {
  const route = useRoute();
  const router = useRouter();
  const allowedKeys = computed(() => filters.all.map((filter) => filter.key));

  useUrlFilters(filters, search);

  watch(
    search,
    async () => {
      const nextQuery = {
        ...route.query,
        ...getSearchQueryParameters(search.value, allowedKeys.value)
      };

      Object.keys(nextQuery).forEach((key) => nextQuery[key] === undefined && Reflect.deleteProperty(nextQuery, key));

      if (isEqual(route.query, nextQuery)) return;

      try {
        await router.replace({
          path: route.path,
          query: nextQuery
        });
      } catch (err) {
        if (!isNavigationFailure(err)) throw err;
      }
    },
    { deep: true }
  );
}
