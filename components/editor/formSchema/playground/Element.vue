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
  <div class="fill-width">
    <component
      :is="fittingComponent"
      :playground-element="playgroundElement"
      :form-schema-element="formSchemaElement"
      style="min-width: 300px;"
      @delete="deleteElementDialogVisible = true"
      @edit="editElementDialogVisible = true"
    >
      <Draggable
        :model-value="props.playgroundElement.children"
        handle=".handle"
        item-key="id"
        :group="{ name: 'g1' }"
        :class="$style.dragarea"
        @add="onElementAdded"
        @update="onElementMoved"
        @remove="onElementRemoved"
      >
        <template #item="{ element, index }">
          <EditorFormSchemaPlaygroundElement
            :playground-element="element"
            :pointer="`${pointer}/children/${index}`"
            @add="(elementPointer, element) => emit('add', elementPointer, element)"
            @move="(oldPosition, newPosition) => emit('move', oldPosition, newPosition)"
            @remove="(elementPointer) => emit('remove', elementPointer)"
            @form-schema-elements-modified="emit('form-schema-elements-modified')"
            @set-translations="emit('set-translations', $event)"
          />
        </template>
      </Draggable>
    </component>
    <EditorFormSchemaPlaygroundEditElementDialog
      v-if="formSchemaElement"
      v-model="editElementDialogVisible"
      :form-schema-element="formSchemaElement"
      :playground-element="playgroundElement"
      :pointer="pointer"
      @update:form-schema-element="onFormSchemaElementEdited"
      @set-translations="emit('set-translations', $event)"
      @add="(elementPointer, element) => emit('add', elementPointer, element)"
      @remove="(elementPointer) => emit('remove', elementPointer)"
    >
      <Draggable
        v-if="formSchemaElement.type === 'Control'"
        :model-value="props.playgroundElement.children"
        handle=".handle"
        item-key="id"
        :group="{ name: 'g1' }"
        :class="$style.dragarea"
        @add="onElementAdded"
        @update="onElementMoved"
        @remove="onElementRemoved"
      >
        <template #item="{ element, index }">
          <EditorFormSchemaPlaygroundElement
            :playground-element="element"
            :pointer="`${pointer}/children/${index}`"
            @add="(elementPointer, element) => emit('add', elementPointer, element)"
            @move="(oldPosition, newPosition) => emit('move', oldPosition, newPosition)"
            @remove="(elementPointer) => emit('remove', elementPointer)"
            @form-schema-elements-modified="emit('form-schema-elements-modified')"
            @set-translations="emit('set-translations', $event)"
          />
        </template>
      </Draggable>
    </EditorFormSchemaPlaygroundEditElementDialog>
    <EditorFormSchemaPlaygroundDeleteElementDialog
      v-if="formSchemaElement"
      v-model="deleteElementDialogVisible"
      :form-schema-element="formSchemaElement"
      @delete="emit('remove', pointer, true)"
    />
  </div>
</template>

<script lang="ts">
export interface IPlaygroundElement {
  id: string;
  children: IPlaygroundElement[];
  readonly?: boolean;
}
</script>

<script setup lang="ts">
import { PropType } from 'vue';
import Draggable from 'vuedraggable';
import { cloneDeep } from 'lodash';

import { FormSchemaElementMap, PROVIDE_KEYS as PLAYGROUND_PROVIDE_KEYS } from './Playground.vue';
import ControlElement from './ControlElement.vue';
import LabelElement from './LabelElement.vue';
import LayoutElement from './LayoutElement.vue';
import { IVeoFormSchemaItem } from '~~/types/VeoTypes';
import { PENDING_TRANSLATIONS } from './EditElementDialog.vue';


const props = defineProps({
  playgroundElement: {
    type: Object as PropType<IPlaygroundElement>,
    required: true
  },
  /**
   * Pointer to this playground element, used to more efficently mutate elements.
   */
  pointer: {
    type: String,
    required: true
  }
});

const emit = defineEmits<{
  (event: 'add', pointer: string, element: IPlaygroundElement | IVeoFormSchemaItem): void
  (event: 'move', oldPosition: string, newPosition: string): void
  (event: 'remove', pointer: string, removeFromSchemaElementMap?: boolean): void
  (event: 'form-schema-elements-modified'): void
  (event: 'set-translations', translations: PENDING_TRANSLATIONS): void
}>();

const { t } = useI18n();

const formSchemaElementMap = inject<FormSchemaElementMap>(PLAYGROUND_PROVIDE_KEYS.formSchemaElementMap);

const formSchemaElement = computed(() => formSchemaElementMap?.get(props.playgroundElement.id));

const fittingComponent = computed(() => {
  switch(formSchemaElement.value?.type) {
    case 'Control':
      return ControlElement;
    case 'Layout':
      return LayoutElement;
    case 'Label':
      return LabelElement;
    case 'Widget':
      return h('div', 'Widget isn\'t implemented yet.');
    default:
      return h('div', t('componentNotFound', [props.playgroundElement.id, formSchemaElement.value?.type]));
  }
});

/* Manipulation
 * Unlike in previous versions, the manipulation gets handled by the playground as this avoids complex merging of multiple mutated children into the original structure
 */
const onElementAdded = (event: any) =>  emit('add', `${props.pointer}/children/${event.newIndex}`, cloneDeep(event.item._underlying_vm_)); // cloneDeep shouldn't be needed, but as we access the element quite dirty, safe is safe

const onElementMoved = (event: any) => emit('move', `${props.pointer}/children/${event.oldIndex}`, `${props.pointer}/children/${event.newIndex}`);

const onElementRemoved = (event: any) => emit('remove', `${props.pointer}/children/${event.oldIndex}`);

const onFormSchemaElementEdited = (editedFormSchemaElement: IVeoFormSchemaItem) => {
  formSchemaElementMap?.set(props.playgroundElement.id, editedFormSchemaElement);
  emit('form-schema-elements-modified');
};

const editElementDialogVisible = ref(false);
const deleteElementDialogVisible = ref(false);
</script>

<i18n>
{
  "en": {
    "componentNotFound": "The type of \"{0}\" isn't supported: {1}."
  },
  "de": {
    "componentNotFound": "\"{0}\" mit dem Typ {1} wird nicht unterstützt."
  }
}
</i18n>

<style module lang="scss">
.dragarea {
  min-height: 100px;
  position: relative;
  z-index: 2;
};
</style>
