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
      <TaskList
        v-model:page="page"
        :tasks="tasks"
        :page-count="pageCount"
        :total-item-count="totalItemCount"
        :page-size="TASKS_PAGE_SIZE"
        :loading="isFetching && !tasks.length"
      />
    </BaseContainer>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-tasks';
</script>

<script setup lang="ts">
import { TASKS_PAGE_SIZE, useFetchTasks } from '~/composables/tasks';

const { t } = useI18n();
const route = useRoute();

const page = ref(0);

const queryParameters = computed(() => ({
  domainId: route.params.domain as string,
  unitId: route.params.unit as string,
  page: page.value
}));

const { data, isFetching } = useFetchTasks(queryParameters);

const tasks = computed(() => data.value?.items ?? []);
const pageCount = computed(() => data.value?.pageCount ?? 1);
const totalItemCount = computed(() => data.value?.totalItemCount ?? 0);

// Reset to the first page if the current one no longer exists, eg. after switching units
watch(pageCount, (newPageCount) => {
  if (page.value > newPageCount - 1) page.value = 0;
});
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-tasks-index.json"></i18n>
