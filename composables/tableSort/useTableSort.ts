/*
 * verinice.veo web
 * Copyright (C) 2025 Aziz Khalledi
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
import type { VeoSort } from '~/types/VeoTypes';

export function useTableSort(sortItem?: VeoSort): { sortBy: Ref<VeoSort> } {
  const route = useRoute();
  const router = useRouter();

  const localSortItem = toRef(sortItem) || ref<VeoSort>({ key: 'name', order: 'asc' });

  const routeSort = computed<VeoSort>(() => {
    const sort = route.query.sort as string;

    if (!sort) return sortItem || { key: 'name', order: 'asc' };

    const [field, order] = sort.split(',');
    return { key: field, order: order === 'asc' || order === 'desc' ? order : 'asc' };
  });

  const updateSortParams = async (field: string, order: string) => {
    const sort = `${field},${order}`;
    const newQuery = { ...route.query, sort: sort !== ',' ? sort : undefined };
    if (newQuery.sort !== route.query.sort) {
      await router.replace({ query: newQuery });
    }
  };

  watch(localSortItem, (newSort) => {
    updateSortParams(newSort.key, newSort.order);
  });
  watch(
    routeSort,
    (newSort) => {
      localSortItem.value = newSort;
    },
    { immediate: true }
  );

  return {
    sortBy: localSortItem
  };
}
