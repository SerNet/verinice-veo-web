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
  <EditorFormSchemaGeneratorElementsGroup
    v-bind="props"
    :key="name"
    @delete="$emit('delete', $event)"
    @update="$emit('update', $event)"
    @update-custom-translation="$emit('update-custom-translation', $event)"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <slot />
  </EditorFormSchemaGeneratorElementsGroup>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { IVeoFormSchemaTranslationCollection } from '~/types/VeoTypes';


const props = defineProps({
  modelValue: {
    type: Object,
    default: undefined
  },
  name: {
    type: String,
    default: undefined
  },
  options: {
    type: Object,
    default: undefined
  },
  customTranslations: {
    type: Object as PropType<IVeoFormSchemaTranslationCollection>,
    default: () => ({})
  },
  formSchemaPointer: {
    type: String,
    default: undefined
  },
  level: {
    type: Number,
    default: undefined
  },
  language: {
    type: String,
    required: true
  },
  createFunction: {
    type: Function,
    required: true
  }
});

defineEmits(['update', 'delete', 'update-custom-translation', 'update:model-value']);
</script>
