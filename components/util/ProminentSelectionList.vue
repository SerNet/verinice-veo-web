<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <v-list v-bind="attrs">
    <v-list-item
      v-for="item of items"
      :key="item.value"
      :title="item.title"
      :subtitle="item.subtitle"
      two-line
      class="prominent-selection-list__item rounded-lg mb-3 py-3 veo-border"
      active-class="prominent-selection-list__item--active"
      :active="isActive(item)"
      @click="onItemSelected(item)"
    >
      <template #prepend>
        <v-icon
          :icon="isActive(item) ? multiple ? mdiCheckboxMarked : mdiRadioboxMarked : multiple ? mdiCheckboxBlankOutline : mdiRadioboxBlank"
          :color="isActive(item) ? 'primary' : undefined"
        />
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { mdiCheckboxMarked, mdiCheckboxBlankOutline, mdiRadioboxBlank, mdiRadioboxMarked } from '@mdi/js';
import { cloneDeep, isArray } from 'lodash';
import { PropType } from 'vue';

export interface IProminentSelectionListItem {
  title: string;
  subtitle: string;
  value: string | number;
}

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: undefined
  },
  multiple: {
    type: Boolean,
    default: false
  },
  items: {
    type: Array as PropType<IProminentSelectionListItem[]>,
    default: () => []
  }
});

const emit = defineEmits(['update:model-value']);

const attrs = useAttrs();

const isActive = (item: IProminentSelectionListItem) => item.value === props.modelValue || (isArray(props.modelValue) && props.modelValue.includes(item.value));

const onItemSelected = (item: IProminentSelectionListItem) => {
  let oldModelValue = cloneDeep(props.modelValue);
  if(props.multiple) {
    const existingItemPosition = !isArray(props.modelValue) ? -1 : props.modelValue.findIndex((value) => item.value === value);
    if(existingItemPosition !== -1) {
      (oldModelValue as any[]).splice(existingItemPosition, 1);
    } else {
      if(!oldModelValue) {
        oldModelValue = [];
      }
      (oldModelValue as any[]).push(item.value);
    }
  } else {
    oldModelValue = item.value;
  }
  emit('update:model-value', oldModelValue);
};
</script>

<style lang="scss" scoped>
.prominent-selection-list__item {
   background-color: #ffffff;
}

.prominent-selection-list__item--active {
  border-color: $primary !important;

  :deep(.v-list-item__overlay) {
    background-color: #ffffff;
  }
}
</style>
