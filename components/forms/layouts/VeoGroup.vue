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
    :id="formSchemaPointer"
    class="vf-layout vf-group my-2 py-1 px-2 pb-2"
    :class="classes"
  >
    <h3
      v-if="options && options.label"
      class="text-h3"
    >
      {{ options.label }}
    </h3>
    <div
      dense
      class="d-flex"
      :class="isHorizontal ? 'flex-row' : 'flex-column'"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api';

import { VeoFormsElementProps } from '../util';
import { IVeoFormsElementDefinition } from '../types';

export const GROUP_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-group',
  name: {
    en: 'group',
    de: 'Gruppe'
  },
  description: {
    en: 'Adds a wrapper around other elements that can be styled.',
    de: 'Fügt einen Container um andere Elemente hinzu, der optional gestyled werden kann.'
  }
};

export default defineComponent({
  name: GROUP_DEFINITION.code,
  props: VeoFormsElementProps,
  setup(props) {
    const classes = computed(() => props.options.class || '');

    const isHorizontal = computed(() => props.options.direction === 'horizontal');

    return {
      classes,
      isHorizontal
    };
  }
});
</script>
