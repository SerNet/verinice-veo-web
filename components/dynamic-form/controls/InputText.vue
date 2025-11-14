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
    :model-value="modelValue"
    :disabled="disabled || options.disabled"
    :error-messages="getControlErrorMessages($props)"
    :label="options && options.label"
    :class="options && options.class"
    class="vf-form-element vf-input-text"
    :clearable="!options.required"
    :data-attribute-name="last(objectSchemaPointer.split('/'))"
    variant="underlined"
    :title="options && options.label"
    :aria-label="options && options.label"
    @update:model-value="$emit('update:model-value', $event)"
    @click:clear="$emit('update:model-value', undefined)"
  />
</template>

<script lang="ts">
import { last } from 'lodash';

import type { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-text-input',
  name: {
    en: 'text input',
    de: 'Texteingabe'
  },
  description: {
    en: 'Lets the user enter text.',
    de: 'Lässt den User Text eingeben.'
  },
  conditions: (props) => [props.objectSchema.type === 'string'],
  bias: Number.EPSILON
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  emits: ['update:model-value'],
  setup() {
    return {
      getControlErrorMessages,

      last
    };
  }
});
</script>
