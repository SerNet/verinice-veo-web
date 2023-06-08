<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
  <BaseTable
    :model-value="modelValue"
    :items="items"
    item-value="id"
    :additional-headers="headers"
    must-sort
    :show-select="selectable"
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script setup lang="ts">
import { TableHeader } from '../base/Table.vue';

const props = withDefaults(defineProps<{
  modelValue?: string[];
  items?: any[];
  selectable?: boolean;
}>(), {
  modelValue: () => [],
  items: () => [],
  selectable: false
});

const headers: TableHeader[] = [
  {
    value: 'abbreviation',
    key: 'abbreviation',
    sortable: true,
    truncate: true,
    width: 80,
    priority: 60,
    order: 30
  },
  {
    value: 'name',
    key: 'name',
    cellClass: ['font-weight-bold'],
    width: 600,
    truncate: true,
    sortable: true,
    priority: 100,
    order: 40
  },
  {
    value: 'description',
    key: 'description',
    sortable: false,
    width: 500,
    truncate: true,
    tooltip: ({ item }: { item: any }) => item.raw.description,
    priority: 30,
    order: 60
  }
];

const emit = defineEmits<{
  (e: 'update:model-value', value: string[]): void;
}>();

watch(() => props.items, (newValue) => {
  const newValues = props.modelValue.filter((selectedItemId: string) => newValue.some((item) => item.id === selectedItemId));
  emit('update:model-value', newValues);
});
</script>
