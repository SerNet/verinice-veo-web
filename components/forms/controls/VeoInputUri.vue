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
  <v-text-field
    v-if="options.visible"
    :id="objectSchemaPointer"
    :value="value"
    :disabled="disabled || options.disabled"
    :error-messages="getControlErrorMessages($props)"
    :label="options && options.label"
    :class="options && options.class"
    class="vf-form-element vf-input-uri"
    :clearable="!options.required"
    hide-details="auto"
    @input="$emit('input', $event)"
    @click:clear="$emit('input', undefined)"
  >
    <template #append-outer>
      <v-btn
        :disabled="!!errors.get(objectSchemaPointer).length || !value"
        icon
        :href="<string>value"
        target="_blank"
        color="primary"
        small
      >
        <v-icon>
          {{ mdiOpenInNew }}
        </v-icon>
      </v-btn>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import { mdiOpenInNew } from '@mdi/js';

import { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-uri-input',
  name: {
    en: 'uri input',
    de: 'URI-Eingabe'
  },
  description: {
    en: 'Lets the user enter text following an uri schema.',
    de: 'Lässt den User Text eingeben der wie eine URI formatiert ist.'
  },
  conditions: (props) => [props.objectSchema.type === 'string', props.objectSchema.format === 'uri']
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  emits: ['input'],
  setup() {
    return {
      getControlErrorMessages,
      mdiOpenInNew
    };
  }
});
</script>
