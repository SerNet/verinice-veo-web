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
  <BaseCard
    border
    margin-bottom
    data-veo-test="task-card"
    :data-component-name="`task-card-${task.type}`"
    @click="emit('click')"
  >
    <div class="d-flex align-center ga-4 pa-3 px-4">
      <v-icon :icon="icon" size="large" class="flex-0-0" data-veo-test="task-card-icon" />

      <div class="flex-1-1 overflow-hidden">
        <div class="text-body-2 text-truncate" data-veo-test="task-card-origin">
          {{ t(`type.${task.type}`) }}: {{ originName }}
        </div>
        <div class="text-body-1 font-weight-medium text-truncate" data-veo-test="task-card-control">
          {{ controlName }}
        </div>
      </div>

      <v-chip
        v-if="formattedDeadline"
        :color="deadlineColor"
        variant="flat"
        size="small"
        class="flex-0-0"
        data-veo-test="task-card-deadline"
      >
        {{ t('dueBy', { date: formattedDeadline }) }}
      </v-chip>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import type { IVeoTask } from '~/types/VeoTask';
import { getDeadlineColor, getTaskIcon, parseDeadline } from '~/utils/tasks';

const props = defineProps<{
  task: IVeoTask;
}>();

const emit = defineEmits<{
  (event: 'click'): void;
}>();

const { t, locale } = useI18n();

const originName = computed(() => props.task.requirementImplementation?.origin?.displayName ?? '');
const controlName = computed(() => props.task.requirementImplementation?.control?.displayName ?? '');

const icon = computed(() => getTaskIcon(props.task.type));
const deadlineColor = computed(() => getDeadlineColor(props.task.deadline));
const formattedDeadline = computed(() => parseDeadline(props.task.deadline)?.toLocaleDateString(locale.value));
</script>

<i18n src="~/locales/base/components/task-card.json"></i18n>
