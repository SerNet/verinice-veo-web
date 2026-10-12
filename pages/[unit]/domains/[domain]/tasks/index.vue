<!--
   - verinice.veo web
   - Copyright (C) 2026  Aziz Khalledi
   -
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BasePage :title="pageTitle" data-component-name="tasks-page">
    <BaseContainer>
      <TaskAssigneeFilter
        v-model="selectedAssignees"
        class="mb-4"
        :persons="persons"
        :loading="personsAreLoading && !personsError"
        :disabled="!defaultAssigneesReady || allPersonsError"
      />

      <BaseAlert
        v-if="defaultAssigneesError"
        :model-value="true"
        :type="VeoAlertType.ERROR"
        :title="t('assigneeFilterError')"
        flat
        no-close-button
      />

      <BaseAlert
        v-else-if="allPersonsError"
        :model-value="true"
        :type="VeoAlertType.ERROR"
        :title="t('assigneeOptionsError')"
        flat
        no-close-button
        class="mb-4"
      />

      <BaseAlert
        v-if="taskListError"
        :model-value="true"
        :type="VeoAlertType.ERROR"
        :title="t('taskListError')"
        flat
        no-close-button
      />

      <TaskList
        v-if="!defaultAssigneesError && !taskListError"
        v-model:page="page"
        :tasks="tasks"
        :page-count="pageCount"
        :total-item-count="totalItemCount"
        :page-size="TASKS_PAGE_SIZE"
        :loading="!defaultAssigneesReady || !tasksAreCurrent || (isFetching && !tasks.length)"
        @click="openTask"
      />

      <ComplianceEditor
        v-if="showDialog"
        :item="requirementImplementation"
        :show-dialog="showDialog"
        :locale="locale"
        @update:show-dialog="showDialog = $event"
      />
    </BaseContainer>
  </BasePage>
</template>

<script lang="ts">
import { ROUTE_DOMAIN_TASKS } from '~/types/routeNames';
export const ROUTE_NAME = ROUTE_DOMAIN_TASKS;
</script>

<script setup lang="ts">
import { UNASSIGNED_ASSIGNEE } from '~/components/task/AssigneeFilter.vue';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import type { IVeoPersonInDomain } from '~/composables/api/queryDefinitions/domains';
import { useQuery } from '~/composables/api/utils/query';
import { TASKS_PAGE_SIZE, useDefaultTaskAssignees, useFetchTasks, useManualTaskFilter } from '~/composables/tasks';
import { useRequirementImplementationQuery } from '~/composables/requirementImplementation';
import type { IVeoTask } from '~/types/VeoTask';
import { VeoAlertType, VeoElementTypePlurals } from '~/types/VeoTypes';

const { t, locale } = useI18n();
const route = useRoute();

const page = ref(0);
const manualTaskFilter = useManualTaskFilter();

const taskScope = computed(() => ({
  domainId: route.params.domain as string,
  unitId: route.params.unit as string
}));
const taskScopeKey = computed(() => `${taskScope.value.domainId}:${taskScope.value.unitId}`);

const {
  assigneeIds: defaultAssigneeIds,
  data: ownPersonsData,
  isError: defaultAssigneesError,
  ready: defaultAssigneesReady
} = useDefaultTaskAssignees(taskScope);

const allPersonsQueryParameters = computed(() => ({
  domainId: taskScope.value.domainId,
  unitId: taskScope.value.unitId
}));
const allPersonsQueryEnabled = computed(() => !!taskScope.value.domainId && !!taskScope.value.unitId);
const {
  data: allPersonsData,
  isError: allPersonsError,
  isFetching: personsAreFetching
} = useQuery(domainQueryDefinitions.queries.fetchPersonsInDomain, allPersonsQueryParameters, {
  enabled: allPersonsQueryEnabled
});

const persons = computed<IVeoPersonInDomain[]>(() => {
  const personsById = new Map<string, IVeoPersonInDomain>();
  for (const person of [...(ownPersonsData.value?.items ?? []), ...(allPersonsData.value?.items ?? [])]) {
    personsById.set(person.id, person);
  }
  return [...personsById.values()];
});

const selectedAssignees = computed<string[]>({
  get: () => {
    const filter =
      (
        manualTaskFilter.value?.domainId === taskScope.value.domainId &&
        manualTaskFilter.value.unitId === taskScope.value.unitId
      ) ?
        manualTaskFilter.value
      : undefined;

    return (
      filter ?
        filter.assigneeIds?.length ? filter.assigneeIds
        : filter.assigneeIds ? [UNASSIGNED_ASSIGNEE]
        : []
      : (defaultAssigneeIds.value ?? [])
    );
  },
  set: (value) => {
    page.value = 0;
    manualTaskFilter.value = {
      ...taskScope.value,
      assigneeIds:
        value.includes(UNASSIGNED_ASSIGNEE) ? []
        : value.length ? value
        : undefined
    };
  }
});

const pageTitle = computed(() =>
  t(!defaultAssigneesReady.value || selectedAssignees.value.length ? 'title' : 'allTasksTitle')
);

const personsAreLoading = computed(() => !defaultAssigneesReady.value || personsAreFetching.value);
const personsError = computed(() => defaultAssigneesError.value || allPersonsError.value);
const taskFilterKey = computed(() => `${taskScopeKey.value}:${JSON.stringify([...selectedAssignees.value].sort())}`);

const queryParameters = computed(() => ({
  ...taskScope.value,
  assigneeIds:
    selectedAssignees.value.includes(UNASSIGNED_ASSIGNEE) ? []
    : selectedAssignees.value.length ? selectedAssignees.value
    : undefined,
  enabled: defaultAssigneesReady.value,
  page: page.value
}));

const { data, isError: tasksError, isFetching, isPlaceholderData } = useFetchTasks(queryParameters);

const loadedTaskFilterKey = ref<string>();
watch(
  [data, isPlaceholderData],
  ([newData, showingPreviousData]) => {
    if (newData !== undefined && !showingPreviousData) loadedTaskFilterKey.value = taskFilterKey.value;
  },
  { immediate: true }
);

const tasksAreCurrent = computed(() => loadedTaskFilterKey.value === taskFilterKey.value);
const taskListError = computed(() => defaultAssigneesReady.value && tasksError.value);
const tasks = computed(() => (defaultAssigneesReady.value && tasksAreCurrent.value ? (data.value?.items ?? []) : []));
const pageCount = computed(() => data.value?.pageCount ?? 1);
const totalItemCount = computed(() => data.value?.totalItemCount ?? 0);

const { showDialog, requirementImplementation, openItem } = useRequirementImplementationQuery();

function openTask(task: IVeoTask) {
  const implementation = task.requirementImplementation;
  const originType = implementation.origin.type as keyof typeof VeoElementTypePlurals;
  const endpoint = VeoElementTypePlurals[originType];
  const targetObject = implementation.origin.id;

  if (!endpoint || !targetObject) return;

  void openItem({
    type: endpoint,
    targetObject,
    item: implementation
  });
}

watch(
  taskScopeKey,
  () => {
    manualTaskFilter.value = undefined;
    page.value = 0;
  },
  { flush: 'sync' }
);

// Reset to the first page if the current one no longer exists, eg. after switching units
watch(pageCount, (newPageCount) => {
  if (page.value > newPageCount - 1) page.value = 0;
});
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-tasks-index.json"></i18n>
