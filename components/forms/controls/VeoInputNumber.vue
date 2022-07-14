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
    :error-messages="errors.get(objectSchemaPointer)"
    :label="options && options.label"
    :class="options && options.class"
    class="vf-form-element vf-input-number"
    type="number"
    :clearable="!options.required"
    hide-details="auto"
    @input="$emit('input', $event)"
    @click:clear="$emit('input', undefined)"
  />
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

import { IVeoFormsElementDefinition } from '../types';
import { VeoFormsControlProps } from '../util';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  key: 'veo-number-input',
  name: {
    en: 'number input',
    de: 'Zahleneingabe'
  },
  description: {
    en: 'Lets the user enter a number, optionally by using spin buttons.',
    de: 'Lässt den User Zahlen eingeben, die Zahl kann mit Buttons rechts höher oder niedriger gestellt werden.'
  },
  conditions: (props) => [props.objectSchema.type === 'number' || props.objectSchema.type === 'integer']
};

export default defineComponent({
  name: CONTROL_DEFINITION.key,
  props: VeoFormsControlProps,
  setup() {
    return {};
  }
});
</script>
