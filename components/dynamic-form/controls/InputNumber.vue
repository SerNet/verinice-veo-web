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
    class="vf-form-element vf-input-number"
    type="number"
    :clearable="!options.required"
    :data-attribute-name="last(objectSchemaPointer.split('/'))"
    variant="underlined"
    @update:model-value="onInput"
    @click:clear="$emit('update:model-value', undefined)" />
</template>

<script lang="ts">
import { last } from 'lodash';

import { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-number-input',
  name: {
    en: 'number input',
    de: 'Zahleneingabe'
  },
  description: {
    en: 'Lets the user enter a number, optionally by using spin buttons.',
    de: 'Lässt den User Zahlen eingeben, die Zahl kann mit Buttons rechts höher oder niedriger gestellt werden.'
  },
  conditions: (props) => [
    props.objectSchema.type === 'number' ||
      props.objectSchema.type === 'integer'
  ]
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const onInput = (data: string | number) => {
      if (typeof data !== 'number') {
        // @ts-ignore Type exists on objectschema, but not on default value (that will never be set if this component gets rendered)
        if (props.objectSchema.type === 'integer') {
          data = parseInt(data, 10);
        } else {
          data = parseFloat(data);
        }
      }

      emit('update:model-value', data);
    };

    return {
      getControlErrorMessages,
      onInput,

      last
    };
  }
});
</script>
