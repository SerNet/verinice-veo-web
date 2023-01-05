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
  <v-checkbox
    v-if="options.visible"
    :id="objectSchemaPointer"
    :input-value="value"
    :disabled="disabled || options.disabled"
    :error-messages="getControlErrorMessages($props)"
    :label="options && options.label"
    :class="options && options.class"
    class="vf-form-element vf-checkbox"
    :indeterminate="value === undefined"
    hide-details="auto"
    color="primary"
    @change="$emit('input', $event)"
  >
    <template
      v-if="value !== undefined"
      #append
    >
      <v-icon @click="$emit('input', undefined)">
        {{ mdiClose }}
      </v-icon>
    </template>
  </v-checkbox>
</template>

<script lang="ts">
import { mdiClose } from '@mdi/js';

import { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-checkbox',
  name: {
    en: 'checkbox',
    de: 'Checkbox'
  },
  description: {
    en: 'Can either be checked or not (true/false). If not required, value can be deleted by pressing X.',
    de: 'Kann entweder angekreuzt werden oder nicht (wahr/falsch). Falls nicht erforderlich, kann der Wert per X gelöscht werden.'
  },
  conditions: (props) => [props.objectSchema.type === 'boolean']
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  emits: ['input'],
  setup() {
    return {
      getControlErrorMessages,
      mdiClose
    };
  }
});
</script>
