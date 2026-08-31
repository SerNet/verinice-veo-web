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
  <div data-veo-test="task-list">
    <template v-if="loading">
      <v-skeleton-loader v-for="index in skeletonCount" :key="index" data-veo-test="loader" type="list-item-two-line" />
    </template>

    <BaseAlert
      v-else-if="!tasks.length"
      :model-value="true"
      :type="VeoAlertType.INFO"
      :title="t('noTasks')"
      flat
      no-close-button
      data-veo-test="task-list-empty"
    />

    <template v-else>
      <TaskCard v-for="(task, index) of tasks" :key="index" :task="task" />

      <div v-if="totalItemCount" class="d-flex align-center justify-end ga-2 mt-2" data-veo-test="task-list-pagination">
        <span class="text-body-2">
          {{ t('paginationRange', { from: firstItemIndex, to: lastItemIndex, total: totalItemCount }) }}
        </span>
        <v-pagination
          v-if="pageCount > 1"
          v-model="displayedPage"
          :length="pageCount"
          :total-visible="0"
          density="comfortable"
          variant="text"
          :aria-label="t('pagination')"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { VeoAlertType } from '~/types/VeoTypes';
import type { IVeoTask } from '~/types/VeoTask';

const props = withDefaults(
  defineProps<{
    tasks: IVeoTask[];
    pageCount?: number;
    totalItemCount?: number;
    pageSize?: number;
    loading?: boolean;
  }>(),
  {
    pageCount: 1,
    totalItemCount: 0,
    pageSize: 10,
    loading: false
  }
);

/** Zero based page, as used by the API. */
const page = defineModel<number>('page', { default: 0 });

const { t } = useI18n();

// v-pagination is one based, the API is zero based
const displayedPage = computed({
  get: () => page.value + 1,
  set: (value: number) => {
    page.value = value - 1;
  }
});

const firstItemIndex = computed(() => (props.totalItemCount ? page.value * props.pageSize + 1 : 0));
const lastItemIndex = computed(() => Math.min(page.value * props.pageSize + props.tasks.length, props.totalItemCount));
const skeletonCount = computed(() => Math.max(props.tasks.length, 3));
</script>

<i18n src="~/locales/base/components/task-list.json"></i18n>
