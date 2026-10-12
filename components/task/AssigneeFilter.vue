<!--
   - verinice.veo web
   - Copyright (C) 2026 Djordje Mirosavljevic
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
  <v-autocomplete
    v-model:search="search"
    :model-value="modelValue"
    :items="items"
    :loading="loading"
    :disabled="disabled"
    :label="t('label')"
    :aria-label="t('label')"
    :no-data-text="t('noResults')"
    item-title="title"
    item-value="value"
    autocomplete="off"
    chips
    hide-details="auto"
    multiple
    menu-icon=""
    variant="outlined"
    data-veo-test="assignee-filter"
    @update:model-value="updateModelValue"
  >
    <template #chip="{ index }">
      <v-chip
        v-if="index === 0"
        class="assignee-filter__selection"
        :closable="!disabled"
        label
        data-veo-test="assignee-filter-selection"
        @click:close="clearSelection"
      >
        <span class="assignee-filter__selection-label">{{ selectionLabel }}</span>
      </v-chip>
    </template>

    <template #item="{ props: itemProps, item }">
      <v-list-item
        v-bind="itemProps"
        :title="undefined"
        :aria-selected="isSelected(item.value)"
        role="option"
        data-veo-test="assignee-filter-item"
      >
        <template #prepend>
          <v-icon
            :icon="isSelected(item.value) ? mdiCheckboxMarked : mdiCheckboxBlankOutline"
            aria-hidden="true"
            data-veo-test="assignee-filter-checkbox"
          />
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </template>

    <template #append-inner>
      <v-btn
        v-if="search"
        :icon="mdiClose"
        :aria-label="t('clearSearch')"
        :title="t('clearSearch')"
        variant="text"
        density="compact"
        size="small"
        data-veo-test="assignee-filter-clear-search"
        @mousedown.prevent
        @click.stop="clearSearch"
      />
      <v-icon :icon="mdiMagnify" class="ml-1" aria-hidden="true" />
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
export const UNASSIGNED_ASSIGNEE = '__unassigned__' as const;

export interface AssigneeFilterPerson {
  id: string;
  abbreviation?: string;
  name?: string;
  displayName?: string;
}

export function getAssigneeLabel(person: AssigneeFilterPerson): string {
  const abbreviation = person.abbreviation?.trim();
  const name = person.name?.trim() || person.displayName?.trim() || person.id;

  if (!abbreviation || name === abbreviation || name.startsWith(`${abbreviation} `)) return name;

  return `${abbreviation} ${name}`;
}
</script>

<script setup lang="ts">
import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiClose, mdiMagnify } from '@mdi/js';

const props = withDefaults(
  defineProps<{
    persons: AssigneeFilterPerson[];
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    loading: false,
    disabled: false
  }
);

const modelValue = defineModel<string[]>({ default: () => [] });
const search = ref('');
const { t } = useI18n();

const items = computed(() => [
  { title: t('nobody'), value: UNASSIGNED_ASSIGNEE },
  ...props.persons.map((person) => ({ title: getAssigneeLabel(person), value: person.id }))
]);

const labelsByValue = computed(() => new Map(items.value.map((item) => [item.value, item.title])));
const selectionLabel = computed(() =>
  t('selection', {
    assignees: modelValue.value.map((value) => labelsByValue.value.get(value) ?? value).join(', ')
  })
);

function isSelected(value: unknown) {
  return typeof value === 'string' && modelValue.value.includes(value);
}

function updateModelValue(value: unknown) {
  const selection = Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  modelValue.value =
    selection.includes(UNASSIGNED_ASSIGNEE) && !modelValue.value.includes(UNASSIGNED_ASSIGNEE) ?
      [UNASSIGNED_ASSIGNEE]
    : selection.filter((item) => item !== UNASSIGNED_ASSIGNEE);
}

function clearSearch() {
  search.value = '';
}

function clearSelection() {
  modelValue.value = [];
  search.value = '';
}
</script>

<style scoped>
.assignee-filter__selection {
  max-width: 100%;
}

.assignee-filter__selection-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<i18n src="~/locales/base/components/task-assignee-filter.json"></i18n>
