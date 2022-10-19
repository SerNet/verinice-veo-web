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
  <v-autocomplete
    v-if="options.visible"
    :id="objectSchemaPointer"
    v-model="internalValue"
    :disabled="disabled || options.disabled"
    :error-messages="getControlErrorMessages($props)"
    :label="options && options.label"
    :class="options && options.class"
    class="vf-form-element vf-autocomplete"
    :clearable="!options.required"
    hide-details="auto"        
    :items="localItems"
    :multiple="multiple"
    @click:clear="$emit('input', undefined)"
  >
    <template
      v-if="multiple"
      #item="{ attrs, item, on }"
    >
      <v-list-item
        v-if="item.value === '_empty_array_'"
        v-bind="attrs"
        v-on="on"
      >
        <v-list-item-title>{{ item.text }}</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-else
        v-bind="attrs"
        style="max-height: 48px"
        v-on="on"
      >
        <v-checkbox
          :input-value="attrs.inputValue"
          color="primary"
        />
        <v-list-item-title>{{ item.text }}</v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-autocomplete',
  name: {
    en: 'autocomplete',
    de: 'Autovervollständigung'
  },
  description: {
    en: 'Lets the user choose a preconfigured option and filter those options by text input.',
    de: 'Lässt den Nutzer aus einer Liste vorkonfigurierter Einträge auswählen, die Liste kann per Textfeld gefiltert werden.'
  },
  conditions: (props) => [
    [undefined, 'string', 'array', 'integer', 'number'].includes(props.objectSchema.type),
    typeof props.objectSchema.enum !== 'undefined' || typeof props.objectSchema.items?.enum !== 'undefined',
    typeof props.options !== 'undefined' && props.options.format === 'autocomplete'
  ]
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  setup(props, { emit }) {
    const { t } = useI18n();

    // @ts-ignore
    const multiple = computed(() => props.objectSchema.type === 'array' && typeof props.objectSchema.items?.enum !== 'undefined');

    // If the user deselects from one item to zero items, we want to pass undefined instead of an empty array as an empty array has to be explicitly selected
    const onItemsChanged = (newValue: any) => {
      if (multiple.value && Array.isArray(newValue) && !newValue.length) {
        emit('input', undefined);
      } else {
        emit('input', Array.isArray(newValue) ? newValue.filter((entry) => entry !== '_empty_array_') : newValue);
      }
    };

    const localItems = computed(() => (multiple.value ? [{ text: t('nothing'), value: '_empty_array_' }] : []).concat(props.items));

    // Needed as _empty_array_ is needed as a value to display the text when selected while it should never be passed down to VeoForms
    const internalValue = computed({
      get() {
        return props.value && Array.isArray(props.value) && props.value.length === 0 ? ['_empty_array_'] : props.value;
      },
      set(newValue: any) {
        const newValueIsArray = Array.isArray(newValue);
        const oldValueIsArray = Array.isArray(props.value);
        const newValueIsEmpty = newValue?.includes('_empty_array_');
        if (newValueIsArray && newValueIsEmpty && oldValueIsArray && !(!props.value.length && newValue.length > 1)) {
          emit('input', []);
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

      getControlErrorMessages
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
