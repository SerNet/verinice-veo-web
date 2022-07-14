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
    :value="value"
    :disabled="disabled || options.disabled"
    :error-messages="errors.get(objectSchemaPointer)"
    :label="options && options.label"
    :class="options && options.class"
    class="vf-form-element vf-select"
    :clearable="!options.required"
    hide-details="auto"        
    :items="items"
    :multiple="multiple"
    @change="$emit('input', $event)"
    @click:clear="$emit('input', undefined)"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api';

import { IVeoFormsElementDefinition } from '../types';
import { VeoFormsControlProps } from '../util';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  key: 'veo-select-input',
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
  name: CONTROL_DEFINITION.key,
  props: VeoFormsControlProps,
  setup(props) {
    // @ts-ignore
    const multiple = computed(() => props.objectSchema.type === 'array' && typeof props.objectSchema.items?.enum !== 'undefined');

    const items = computed(() => {
      let items: any[] = [];

      if (props.objectSchema.enum) {
        items = props.objectSchema.enum;
        // @ts-ignore
      } else if (props.objectSchema.items?.enum) {
        // @ts-ignore
        items = props.objectSchema.items?.enum;
      }

      return items.map((item, index) => (props.options.enum ? { text: props.options.enum[index], value: item } : { text: props.translations[item] || item, value: item }));
    });

    return {
      items,
      multiple
    };
  }
});
</script>
