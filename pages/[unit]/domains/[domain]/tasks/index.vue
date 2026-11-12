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
  <BasePage :title="t('title')" data-component-name="tasks-page">
    <BaseContainer>
      <TaskAssigneeFilter
        v-model="selectedAssignees"
        class="mb-4"
        :persons="persons"
        :loading="personsAreLoading && !personsError"
        :disabled="!defaultAssigneesReady || allPersonsError"
      />

      <BaseAlert
        v-if="showPersonAssignmentHint"
        :model-value="true"
        :type="VeoAlertType.INFO"
        :title="t('personAssignmentHint')"
        :buttons="personAssignmentButtons"
        flat
        no-close-button
        class="mb-4"
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

      <ObjectAddObjectDialog
        v-if="personAssignmentDialogOpen"
        v-model="personAssignmentDialogOpen"
        :domain-id="taskScope.domainId"
        object-type="person"
        :disabled-fields="['objectType']"
        :selectable-item-filter="isUnassignedPerson"
        :allow-create-and-open="false"
        :create-object-defaults="{ username }"
        :on-link="linkPersonToCurrentUser"
        @success="handlePersonLinked"
      />
    </BaseContainer>
  </BasePage>
</template>

<script lang="ts">
import { ROUTE_DOMAIN_TASKS } from '~/types/routeNames';
export const ROUTE_NAME = ROUTE_DOMAIN_TASKS;
</script>

<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import { UNASSIGNED_ASSIGNEE } from '~/components/task/AssigneeFilter.vue';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import type { IVeoPersonInDomain } from '~/composables/api/queryDefinitions/domains';
import elementQueryDefinitions from '~/composables/api/queryDefinitions/elements';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery, useQuerySync } from '~/composables/api/utils/query';
import { TASKS_PAGE_SIZE, useDefaultTaskAssignees, useFetchTasks, useManualTaskFilter } from '~/composables/tasks';
import { useRequirementImplementationQuery } from '~/composables/requirementImplementation';
import { useVeoUser } from '~/composables/VeoUser';
import type { IVeoTask } from '~/types/VeoTask';
import { type IVeoEntity, VeoAlertType, VeoElementTypePlurals } from '~/types/VeoTypes';
import { getObjectDetailPath } from '~/utils/objectPath';

const { t, locale } = useI18n();
const route = useRoute();
const queryClient = useQueryClient();
const { profile } = useVeoUser();

const page = ref(0);
const manualTaskFilter = useManualTaskFilter();
const personAssignmentDialogOpen = ref(false);
const linkedPersonId = ref<string>();
const username = computed(() => profile.value?.username as string | undefined);

const taskScope = computed(() => ({
  domainId: route.params.domain as string,
  unitId: route.params.unit as string
}));
const taskScopeKey = computed(() => `${taskScope.value.domainId}:${taskScope.value.unitId}`);

const {
  assigneeIds: defaultAssigneeIds,
  data: ownPersonsData,
  isError: defaultAssigneesError,
  ready: defaultAssigneesReady,
  refetch: refetchDefaultAssignees
} = useDefaultTaskAssignees(taskScope);

const allPersonsQueryParameters = computed(() => ({
  domainId: taskScope.value.domainId,
  unitId: taskScope.value.unitId,
  size: '9999'
}));
const allPersonsQueryEnabled = computed(() => !!taskScope.value.domainId && !!taskScope.value.unitId);
const {
  data: allPersonsData,
  isError: allPersonsError,
  isFetching: personsAreFetching
} = useQuery(domainQueryDefinitions.queries.fetchPersonsInDomain, allPersonsQueryParameters, {
  enabled: allPersonsQueryEnabled
});

const unassignedPersonIds = computed(
  () => new Set((allPersonsData.value?.items ?? []).filter((person) => !person.username?.trim()).map(({ id }) => id))
);
const isUnassignedPerson = (person: IVeoEntity) => unassignedPersonIds.value.has(person.id);

const showPersonAssignmentHint = computed(
  () =>
    !!username.value &&
    defaultAssigneesReady.value &&
    !defaultAssigneesError.value &&
    !allPersonsError.value &&
    allPersonsData.value !== undefined &&
    !linkedPersonId.value &&
    defaultAssigneeIds.value?.length === 0
);
const personAssignmentButtons = computed(() => [
  {
    text: t('linkMyPerson'),
    dataVeoTest: 'link-my-person',
    onClick: () => (personAssignmentDialogOpen.value = true)
  }
]);

const { mutateAsync: updatePerson } = useMutation(elementQueryDefinitions.mutations.updateObject);

async function linkPersonToCurrentUser([person]: IVeoEntity[]) {
  if (!person || !username.value) return;

  const fullPerson = await useQuerySync(
    elementQueryDefinitions.queries.fetch,
    {
      domain: taskScope.value.domainId,
      endpoint: VeoElementTypePlurals.person,
      id: person.id
    },
    queryClient
  );

  if (fullPerson.username?.trim()) throw new Error(t('personAlreadyAssigned'));

  await updatePerson({
    domain: taskScope.value.domainId,
    endpoint: VeoElementTypePlurals.person,
    id: person.id,
    object: { ...fullPerson, username: username.value }
  });
}

async function handlePersonLinked([personId]: string[]) {
  if (!personId) return;

  const linkedScope = { ...taskScope.value };
  page.value = 0;
  linkedPersonId.value = personId;
  manualTaskFilter.value = { ...linkedScope, assigneeIds: [personId] };

  const result = await refetchDefaultAssignees();
  const linkedPersonWasLoaded = result.data?.items.some(({ id }) => id === personId);
  const activeFilter = manualTaskFilter.value;
  if (
    linkedPersonWasLoaded &&
    activeFilter?.domainId === linkedScope.domainId &&
    activeFilter.unitId === linkedScope.unitId &&
    activeFilter.assigneeIds?.length === 1 &&
    activeFilter.assigneeIds[0] === personId
  ) {
    manualTaskFilter.value = undefined;
  }
}

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
  if (task.type === 'inspection-finding') {
    const path = getObjectDetailPath(task.object, {
      domain: taskScope.value.domainId,
      unit: taskScope.value.unitId
    });
    if (path) void navigateTo(path);
    return;
  }

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
    linkedPersonId.value = undefined;
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
