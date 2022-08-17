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
    :value="value"
    :disabled="disabled || options.disabled"
    :error-messages="getControlErrorMessages($props)"
    :label="options && options.label"
    :class="options && options.class"
    class="vf-form-element vf-checkbox"
    :indeterminate="value === undefined"
    hide-details="auto"
    color="primary"
    @change="onChange"
  >
    <template #append>
      <v-icon @click="$emit('input', undefined)">
        {{ mdiClose }}
      </v-icon>
    </template>
  </v-checkbox>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';
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
  setup(_, { emit }) {
    const onChange = (newValue: any) => {
      // VEO-1573 Casting to boolean, somehow the value would be a string otherwise
      emit('input', newValue === true);
    };

    return {
      onChange,
      getControlErrorMessages,
      mdiClose
    };
  }
});
</script>
