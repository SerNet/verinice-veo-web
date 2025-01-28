<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <v-sheet rounded border class="fill-width pb-1 my-1" data-component-name="label-form-element">
    <v-card-actions>
      <div class="handle mr-1">
        <v-icon :icon="mdiDrag" />
      </div>
      <EditorFormSchemaPlaygroundRuleIcon :rule="formSchemaElement.rule" class="mr-1" />
      {{ t('text') }}
      <v-spacer />
      <v-btn :icon="mdiPencilOutline" size="small" @click="emit('edit')" />
      <v-btn :icon="mdiTrashCanOutline" size="small" @click="emit('delete')" />
    </v-card-actions>
    <div class="mx-2">
      <EditorTranslationsTranslatedElementTitle :form-schema-element="formSchemaElement" />
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { mdiDrag, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import { PropType } from 'vue';

import { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import { IPlaygroundElement } from './Element.vue';

defineProps({
  playgroundElement: {
    type: Object as PropType<IPlaygroundElement>,
    required: true
  },
  formSchemaElement: {
    type: Object as PropType<IVeoFormSchemaItem>,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);

const { t } = useI18n();
</script>

<i18n src="~/locales/base/components/editor-form-schema-playground-label-element.json"></i18n>
