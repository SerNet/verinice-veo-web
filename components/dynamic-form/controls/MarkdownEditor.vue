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
    class="vf-markdown-editor vf-form-element"
    :class="{ 'is-disabled': disabled || options.disabled }"
    :data-attribute-name="last(objectSchemaPointer.split('/'))"
  >
    <div v-if="options.label" class="subtitle-1">
      {{ options.label }}
    </div>

    <ToastUIViewer v-if="isViewer" :model-value="modelValue" />

    <ToastUIEditor
      v-else
      :model-value="modelValue"
      @update:model-value="(markdown) => emit('update:model-value', markdown)"
    />
  </div>
</template>

<script lang="ts">
import type { IVeoFormsElementDefinition } from '../types';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-markdown-editor',
  name: {
    en: 'markdown editor',
    de: 'Markdown editor'
  },
  description: {
    en: 'WYSIWYG markdown editor to style input.',
    de: 'WYSIWYG Markdown editor um Eingaben zu formatieren.'
  },
  conditions: (props) => [
    props.objectSchema.type === 'string',
    typeof props.options !== 'undefined' && props.options.format === 'markdown'
  ]
};
</script>

<script setup lang="ts">
import { last } from 'lodash';
import { VeoFormsControlProps } from '../util';

defineOptions({
  name: CONTROL_DEFINITION.code
});

const props = defineProps(VeoFormsControlProps);
const emit = defineEmits<{
  'update:model-value': [value: string | undefined];
}>();

const isViewer = computed(() => props.options.disabled || props.disabled);
</script>
<i18n src="~/locales/base/components/dynamic-form-controls-markdown-editor.json"></i18n>
