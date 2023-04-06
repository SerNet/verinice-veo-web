<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <v-select
    v-if="options.visible"
    :id="objectSchemaPointer"
    v-model="internalValue"
    :disabled="disabled || options.disabled"
    :error-messages="getControlErrorMessages($props)"
    :label="options && options.label"
    :class="options && options.class"
    class="vf-form-element vf-select"
    :clearable="!options.required"
    :data-attribute-name="last(objectSchemaPointer.split('/'))"     
    :items="localItems"
    :multiple="multiple"
    autocomplete="off"
    variant="underlined"
    @click:clear="$emit('update:model-value', undefined)"
  >
    <template
      v-if="multiple"
      #item="{ props, item }"
    >
      <v-list-item
        v-if="item.value === '_empty_array_'"
        v-bind="props"
        :active="isEmpty(modelValue)"
        active-color="primary"
      />
      <v-list-item
        v-else
        v-bind="props"
        style="max-height: 48px"
        :title="undefined"
        :active="isArray(modelValue) && modelValue?.includes(item.value)"
        active-color="primary"
      >
        <div class="d-flex align-center">
          <v-icon
            :color="isArray(modelValue) && modelValue?.includes(item.value) ? 'primary' : undefined"
            start
            :icon="isArray(modelValue) && modelValue?.includes(item.value) ? mdiCheckboxMarked : mdiCheckboxBlankOutline"
          />
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </div>
      </v-list-item>
    </template>
  </v-select>
</template>

<script lang="ts">
import { isArray, isEmpty, last } from 'lodash';
import { mdiCheckboxBlankOutline, mdiCheckboxMarked } from '@mdi/js';

import { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-select-input',
  name: {
    en: 'select input',
    de: 'Auswahl'
  },
  description: {
    en: 'Lets the user select an option from a dropdown list. Can be configured to allow multi select.',
    de: 'Lässt den User einen Eintrag aus einer Dropdown-Liste auswählen. Kann als Mehrfachauswahl konfiguriert werden.'
  },
  conditions: (props) => [
    [undefined, 'string', 'integer', 'number', 'array'].includes(props.objectSchema.type),
    typeof props.objectSchema.enum !== 'undefined' || typeof props.objectSchema.items?.enum !== 'undefined'
  ]
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const { t } = useI18n();
    // @ts-ignore At this point we expect objectSchema to be set, so type WILL exist
    const multiple = computed(() => props.objectSchema.type === 'array' && typeof props.objectSchema.items?.enum !== 'undefined');

    // If the user deselects from one item to zero items, we want to pass undefined instead of an empty array as an empty array has to be explicitly selected
    const onItemsChanged = (newValue: any) => {
      if (multiple.value && Array.isArray(newValue) && !newValue.length) {
        emit('update:model-value', undefined);
      } else {
        emit('update:model-value', Array.isArray(newValue) ? newValue.filter((entry) => entry !== '_empty_array_') : newValue);
      }
    };

    const localItems = computed(() => (multiple.value ? [{ title: t('nothing'), value: '_empty_array_' }] : []).concat(props.items));

    // Needed as _empty_array_ is needed as a value to display the text when selected while it should never be passed down to VeoForms
    const internalValue = computed({
      get() {
        return props.modelValue && Array.isArray(props.modelValue) && props.modelValue.length === 0 ? ['_empty_array_'] : props.modelValue;
      },
      set(newValue: any) {
        const newValueIsArray = Array.isArray(newValue);
        const oldValueIsArray = Array.isArray(props.modelValue);
        const newValueIsEmpty = Array.isArray(newValue) && newValue?.includes('_empty_array_');
        if (newValueIsArray && newValueIsEmpty && oldValueIsArray && !(!props.modelValue.length && newValue.length > 1)) {
          emit('update:model-value', []);
        } else {
          onItemsChanged(newValue);
        }
      }
    });

    return {
      internalValue,
      localItems,
      multiple,
      onItemsChanged,
      isArray,

      getControlErrorMessages,
      isEmpty,
      last,
      mdiCheckboxBlankOutline,
      mdiCheckboxMarked
    };
  }
});
</script>

<i18n>
{
  "en": {
    "nothing": "Nothing"
  },
  "de": {
    "nothing": "Keine/Keins"
  }
}
</i18n>
