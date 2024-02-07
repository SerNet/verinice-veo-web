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
  <div v-if="options.visible" :id="formSchemaPointer" class="vf-label" :class="options && options.class">
    {{ options.label }}
  </div>
</template>

<script lang="ts">
import { VeoFormsElementProps } from '../util';
import { IVeoFormsElementDefinition } from '../types';

export const LABEL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-label',
  name: {
    en: 'label',
    de: 'Label'
  },
  description: {
    en: 'Adds non-editable text to the form.',
    de: 'Fügt Text in ein Formular ein.'
  }
};

export default defineComponent({
  name: LABEL_DEFINITION.code,
  props: VeoFormsElementProps,
  setup() {
    return {};
  }
});
</script>
