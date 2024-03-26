<!--
   - verinice.veo web
   - Copyright (C) 2024 Jonas Heitmann, Frank Schneider
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
  <v-expansion-panels
    v-if="options.visible"
    :id="formSchemaPointer"
    v-model="panel"
    class="vf-layout vf-expansion-panel my-2 py-1 px-2 pb-2"
    :class="classes"
  >
    <v-expansion-panel :title="options?.label || 'accordion'">
      <template #text>
        <div dense class="d-flex" :class="isHorizontal ? 'flex-row' : 'flex-column'">
          <slot />
        </div>
      </template>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { VeoFormsElementProps } from '../util';
import { IVeoFormsElementDefinition } from '../types';

export const GROUP_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-accordion',
  name: {
    en: 'accordion',
    de: 'Akkordion'
  },
  description: {
    en: 'Adds a wrapper around other elements that can be collapsed or expanded.',
    de: 'Fügt einen Container um andere Elemente hinzu, der aus- und eingeklappt werden kann.'
  },
  conditions: (props) => [props.options.format === 'accordion']
};

export default defineComponent({
  name: GROUP_DEFINITION.code,
  props: VeoFormsElementProps,
  setup(props) {
    const classes = computed(() => props.options.class || '');
    const isHorizontal = computed(() => props.options.direction === 'horizontal');
    const panel = ref(0);

    return {
      classes,
      isHorizontal,
      panel
    };
  }
});
</script>
