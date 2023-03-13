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
  <component
    :is="fittingComponent"
    :playground-element="playgroundElement"
    :form-schema-element="formSchemaElement"
    style="min-width: 300px;"
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
        />
      </template>
    </Draggable>
  </component>
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
  (event: 'add', pointer: string, element: IPlaygroundElement): void
  (event: 'move', oldPosition: string, newPosition: string): void
  (event: 'remove', pointer: string): void
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
