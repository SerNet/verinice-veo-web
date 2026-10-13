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

import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import taskQueryDefinitions from '~/composables/api/queryDefinitions/tasks';
import { useQuery } from '~/composables/api/utils/query';
import { useVeoUser } from '~/composables/VeoUser';
import { hasFeature } from '~/utils/featureFlags';

export const TASKS_PAGE_SIZE = 10;

export interface TaskScopeParameters {
  domainId?: string;
  unitId?: string;
}

export interface FetchTasksParameters extends TaskScopeParameters {
  assigneeIds?: string[];
  enabled?: boolean;
  page?: number;
  size?: number;
}

export interface ManualTaskFilter extends TaskScopeParameters {
  assigneeIds?: string[];
}

export function useManualTaskFilter() {
  return useState<ManualTaskFilter | undefined>('manual-task-filter', () => undefined);
}

export function useFetchTasks(parameters: MaybeRef<FetchTasksParameters>) {
  const tasksEnabled = hasFeature('tasks');

  const queryParameters = computed(() => {
    const { assigneeIds, domainId, unitId, page, size } = unref(parameters);

    return {
      domainId: domainId as string,
      unit: unitId as string,
      assigneeIds: assigneeIds === undefined ? undefined : [...assigneeIds].sort(),
      page: page ?? 0,
      size: size ?? TASKS_PAGE_SIZE
    };
  });

  const enabled = computed(() => {
    const { domainId, enabled: queryEnabled, unitId } = unref(parameters);
    return tasksEnabled && queryEnabled !== false && !!domainId && !!unitId;
  });

  return useQuery(taskQueryDefinitions.queries.fetchAll, queryParameters, { enabled });
}

export function useDefaultTaskAssignees(parameters: MaybeRef<TaskScopeParameters>) {
  const tasksEnabled = hasFeature('tasks');
  const { profile } = useVeoUser();
  const username = computed(() => profile.value?.username as string | undefined);

  const queryParameters = computed(() => {
    const { domainId, unitId } = unref(parameters);
    return {
      domainId: domainId as string,
      unitId,
      username: username.value
    };
  });

  const enabled = computed(() => {
    const { domainId, unitId } = unref(parameters);
    return tasksEnabled && !!domainId && !!unitId && !!username.value;
  });

  const query = useQuery(domainQueryDefinitions.queries.fetchPersonsInDomain, queryParameters, { enabled });
  const scopeReady = computed(() => {
    const { domainId, unitId } = unref(parameters);
    return tasksEnabled && !!domainId && !!unitId && profile.value !== undefined;
  });
  const ready = computed(() => scopeReady.value && (!username.value || query.data.value !== undefined));
  const assigneeIds = computed<string[] | undefined>(() => {
    if (!ready.value) return undefined;
    if (!username.value) return [];
    return (query.data.value?.items ?? []).map(({ id }) => id);
  });

  return { ...query, assigneeIds, ready };
}

export function useTaskCount(
  parameters: MaybeRef<Pick<FetchTasksParameters, 'assigneeIds' | 'domainId' | 'enabled' | 'unitId'>>
) {
  const countParameters = computed(() => ({ ...unref(parameters), page: 0, size: 1 }));
  const { data, isFetching, isPlaceholderData } = useFetchTasks(countParameters);

  return {
    count: computed(() =>
      unref(parameters).enabled === false || isPlaceholderData.value ? 0 : (data.value?.totalItemCount ?? 0)
    ),
    isLoading: computed(() => isFetching.value || isPlaceholderData.value)
  };
}

export function useNavigationTaskCount(parameters: MaybeRef<TaskScopeParameters>) {
  const manualFilter = useManualTaskFilter();
  const { assigneeIds, isError: defaultAssigneesError, ready } = useDefaultTaskAssignees(parameters);
  const activeManualFilter = computed(() => {
    const scope = unref(parameters);
    const filter = manualFilter.value;
    return filter && filter.domainId === scope.domainId && filter.unitId === scope.unitId ? filter : undefined;
  });
  const countParameters = computed(() => {
    const scope = unref(parameters);
    const filter = activeManualFilter.value;

    return {
      ...scope,
      assigneeIds:
        filter ? filter.assigneeIds
        : assigneeIds.value?.length ? assigneeIds.value
        : undefined,
      enabled: filter ? true : ready.value
    };
  });

  const taskCount = useTaskCount(countParameters);
  const waitingForDefaultFilter = computed(() => {
    const scope = unref(parameters);
    return (
      !!scope.domainId && !!scope.unitId && !activeManualFilter.value && !defaultAssigneesError.value && !ready.value
    );
  });

  return {
    count: taskCount.count,
    isLoading: computed(() => waitingForDefaultFilter.value || taskCount.isLoading.value)
  };
}
