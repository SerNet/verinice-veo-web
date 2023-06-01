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
  <v-data-table
    :model-value="modelValue"
    :items="items"
    item-value="id"
    :headers="headers"
    must-sort
    :show-select="selectable"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #item.title="{ item }">
      <div class="font-weight-bold text-no-wrap">
        {{ item.title }}
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang=ts">
import { PropType } from 'vue';

export interface IVeoCatalogSelectionListHeader {
  filterable?: boolean;
  sortable: boolean;
  title: string;
  value: string;
  width?: number;
}

const props = defineProps({
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  items: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  headers: {
    type: Array as PropType<IVeoCatalogSelectionListHeader[]>,
    default: () => []
  },
  selectable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:model-value']);

watch(() => props.items, (newValue) => {
  const newValues = props.modelValue.filter((selectedItemId: string) => newValue.some((item) => item.id === selectedItemId));
  emit('update:model-value', newValues);
});
</script>
