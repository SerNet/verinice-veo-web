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
  <div
    v-if="options.visible"
    class="vf-radio vf-form-element"
    :data-attribute-name="last(objectSchemaPointer.split('/'))"
  >
    <v-radio-group
      :id="objectSchemaPointer"
      :inline="!isVertical"
      :model-value="modelValue"
      :disabled="disabled || options.disabled"
      :error-messages="getControlErrorMessages($props)"
      :label="options && options.label"
      :class="options && options.class"
      @update:model-value="$emit('update:model-value', $event)"
    >
      <template #default>
        <v-radio
          v-for="(item, i) in items"
          :key="i"
          :value="item.value"
          :label="item.title"
          color="primary"
        />
      </template>
      <template
        v-if="modelValue !== undefined"
        #append
      >
        <v-btn
          :icon="mdiClose"
          variant="text"
          @click="$emit('update:model-value', undefined)"
        />
      </template>
    </v-radio-group>
  </div>
</template>

<script lang="ts">
import{ last } from 'lodash';
import { mdiClose } from '@mdi/js';

import { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-radio-button',
  name: {
    en: 'radio button',
    de: 'Radio Auswahl'
  },
  description: {
    en: 'radio button to select one of multiple options.',
    de: 'Radio Auswahl um einen von mehreren Einträgen auszuwählen.'
  },
  conditions: (props) => [
    [undefined, 'string', 'integer', 'number'].includes(props.objectSchema.type),
    typeof props.objectSchema.enum !== 'undefined',
    props.options?.format === 'radio'
  ]
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  emits: ['update:model-value'],
  setup(props) {
    const isVertical = computed(() => props.options.direction === 'vertical');

    return {
      isVertical,

      getControlErrorMessages,
      mdiClose,
      last
    };
  }
});
</script>
<style lang="scss">
.v-radio-group > .v-input__control > .v-label {
    margin-inline-start: 0;
}
</style>
