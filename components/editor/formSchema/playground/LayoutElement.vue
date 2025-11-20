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
  <v-sheet rounded border class="fill-width pb-1 my-1" data-component-name="layout-form-element">
    <v-card-actions v-if="!playgroundElement.readonly">
      <div class="handle mr-1">
        <v-icon :icon="mdiDrag" />
      </div>
      <EditorFormSchemaPlaygroundRuleIcon :rule="formSchemaElement.rule" class="mr-1" />
      {{ t('layout') }} ({{ t(`layoutType.${formSchemaElement.options.format}`) }})
      <v-spacer />
      <v-btn :icon="mdiPencilOutline" size="small" @click="emit('edit')" />
      <v-btn :icon="mdiTrashCanOutline" size="small" @click="emit('delete')" />
    </v-card-actions>
    <div class="mx-2">
      <EditorTranslationsTranslatedElementTitle :form-schema-element="formSchemaElement" class="mb-1" />
      <div
        :class="[
          $style['child-layout-wrapper'],
          formSchemaElement.options?.direction === 'horizontal' ?
            $style['child-layout-wrapper--horizontal']
          : $style['child-layout-wrapper--vertical']
        ]"
      >
        <slot></slot>
        <span
          v-if="!playgroundElement.children.length"
          :class="$style.dragarea__placeholder"
          class="d-flex justify-center align-center fill-width fill-height"
        >
          {{ t('addElementToGroup') }}
        </span>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { mdiDrag, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';

import type { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import type { IPlaygroundElement } from './Element.vue';

defineProps<{
  playgroundElement: IPlaygroundElement;
  formSchemaElement: IVeoFormSchemaItem;
}>();

const emit = defineEmits<{
  (event: 'edit' | 'delete'): void;
}>();

const { t } = useI18n();
</script>

<i18n src="~/locales/base/components/editor-form-schema-playground-layout-element.json"></i18n>

<style lang="scss" module>
@use 'assets/styles/_variables.scss';

.child-layout-wrapper {
  position: relative;
}

.child-layout-wrapper > div {
  display: flex;
  overflow-x: auto;
}

.child-layout-wrapper--vertical > div {
  flex-direction: column;
}

.child-layout-wrapper--horizontal > div {
  flex-direction: row;
}

.dragarea__placeholder {
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='grey' stroke-width='2' stroke-dasharray='20' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
  border-radius: 12px;
  bottom: 0;
  color: variables.$medium-grey;
  left: 0;
  position: absolute !important;
  right: 0;
  top: 0;
  z-index: 1;
}
</style>
