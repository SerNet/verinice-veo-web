<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
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
  <div class="vf-control">
    <EditorFormSchemaGeneratorElementsFormElement
      v-bind="$props"
      @update="$emit('update', $event)"
      @delete="$emit('delete', $event)"
      @update-custom-translation="$emit('update-custom-translation', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { JSONSchema7 } from 'json-schema';
import { UISchemaElement } from '@/types/UISchema';

import { IVeoFormSchemaTranslationCollection, IVeoTranslationCollection } from '~/types/VeoTypes';

defineProps({
  name: { type: String, default: '' },
  schema: {
    type: Object as PropType<JSONSchema7>,
    default: undefined
  },
  generalTranslation: {
    type: Object as PropType<IVeoTranslationCollection>,
    default: () => ({})
  },
  customTranslations: {
    type: Object as PropType<IVeoFormSchemaTranslationCollection>,
    default: () => ({})
  },
  elements: {
    type: Array as PropType<UISchemaElement[]>,
    default: () => []
  },
  options: {
    type: Object,
    default: undefined
  },
  modelValue: {
    type: Object,
    default: undefined
  },
  formSchemaPointer: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: true
  },
  scope: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    required: true
  }
});

defineEmits(['update', 'delete', 'update-custom-translation']);
</script>
