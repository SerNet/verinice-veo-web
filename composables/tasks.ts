/*
 * verinice.veo web
 * Copyright (C) 2026 Aziz Khalledi
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
import { computed, unref, type MaybeRef } from 'vue';

import taskQueryDefinitions from '~/composables/api/queryDefinitions/tasks';
import { useQuery } from '~/composables/api/utils/query';
import { hasFeature } from '~/utils/featureFlags';

export const TASKS_PAGE_SIZE = 10;

interface FetchTasksParameters {
  domainId?: string;
  unitId?: string;
  page?: number;
  size?: number;
}

export function useFetchTasks(parameters: MaybeRef<FetchTasksParameters>) {
  const tasksEnabled = hasFeature('tasks');

  const queryParameters = computed(() => {
    const { domainId, unitId, page, size } = unref(parameters);

    return {
      domainId: domainId as string,
      unit: unitId as string,
      page: page ?? 0,
      size: size ?? TASKS_PAGE_SIZE
    };
  });

  const enabled = computed(() => {
    const { domainId, unitId } = unref(parameters);
    return tasksEnabled && !!domainId && !!unitId;
  });

  return useQuery(taskQueryDefinitions.queries.fetchAll, queryParameters, { enabled });
}

export function useTaskCount(parameters: MaybeRef<Pick<FetchTasksParameters, 'domainId' | 'unitId'>>) {
  const countParameters = computed(() => ({ ...unref(parameters), page: 0, size: 1 }));
  const { data } = useFetchTasks(countParameters);

  return computed(() => data.value?.totalItemCount ?? 0);
}
