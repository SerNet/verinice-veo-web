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
   - along with this program. If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <v-list class="mt-2" v-bind="$attrs" role="list">
    <v-list-item
      v-for="item of items"
      :key="item.value"
      :active="isActive(item)"
      :disabled="item.disabled"
      :subtitle="item.subtitle"
      :title="item.title"
      class="rounded mb-2 py-2 bg-accent"
      role="listitem"
      two-line
      @click="checkBoxSelectionOnly ? undefined : onItemSelected(item)"
    >
      <template #default>
        <slot :name="`item-${item.value}`" />
      </template>

      <template #prepend>
        <v-icon
          :color="isActive(item) ? 'primary' : undefined"
          :aria-label="item.value"
          :icon="
            isActive(item) ?
              multiple ? mdiCheckboxMarked
              : mdiRadioboxMarked
            : multiple ? mdiCheckboxBlankOutline
            : mdiRadioboxBlank
          "
          @click="checkBoxSelectionOnly ? onItemSelected(item) : undefined"
        />
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { cloneDeep, isArray } from 'lodash';
import { PropType } from 'vue';
import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiRadioboxBlank, mdiRadioboxMarked } from '@mdi/js';

export interface IProminentSelectionListItem {
  disabled?: boolean;
  subtitle: string;
  title: string;
  value: string | number;
}

const props = defineProps({
  items: {
    type: Array as PropType<IProminentSelectionListItem[]>,
    default: () => []
  },
  modelValue: {
    type: [String, Number, Array],
    default: undefined
  },
  multiple: {
    type: Boolean,
    default: false
  },
  checkBoxSelectionOnly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  (event: 'update:model-value', value: any): void;
}>();

const isActive = (item: IProminentSelectionListItem) =>
  item.value === props.modelValue || (isArray(props.modelValue) && props.modelValue.includes(item.value));

const onItemSelected = (item: IProminentSelectionListItem) => {
  let oldModelValue = cloneDeep(props.modelValue);

  if (props.multiple) {
    const existingItemPosition =
      !isArray(props.modelValue) ? -1 : props.modelValue.findIndex((value) => item.value === value);

    if (existingItemPosition !== -1) {
      (oldModelValue as any[]).splice(existingItemPosition, 1);
    } else {
      if (!oldModelValue) {
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
