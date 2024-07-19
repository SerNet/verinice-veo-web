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

import { max, omit } from 'lodash';

export function useSearch({ baseQueryParameters, search }: { baseQueryParameters: any; search: VeoSearch[] }) {
  const config = useRuntimeConfig();
  const data = ref([]);
  const isLoading = ref(false);

  async function getSearchResults() {
    watch(
      [baseQueryParameters, search],
      async () => {
        const parameters = ref({
          ...baseQueryParameters.value,
          page: baseQueryParameters.value.page ? max([baseQueryParameters.value.page - 1, 0]) : 0,
          ...getSearchQueryParameters(search.value)
        });
        try {
          isLoading.value = true;
          data.value = await useQuerySync(elementQueryDefinitions.queries.fetchAll, { ...parameters.value });
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
  console.log({ search });
  return search.reduce(
    (queries, query) => ({
      ...queries,
      ...(query.term && query.operator == '=' ? { [query.searchFilter]: query.term } : {})
    }),
    {}
  );
}
