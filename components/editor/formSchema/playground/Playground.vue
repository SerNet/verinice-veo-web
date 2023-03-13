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
  <EditorFormSchemaPlaygroundElement
    v-if="playgroundElements"
    :playground-element="playgroundElements"
    pointer="#"
    @add="onAddElement"
    @move="onMoveElement"
    @remove="onRemoveElement"
  />
</template>

<script lang="ts">
export const FORMSCHEMA_PLAYGROUND_NAMESPACE = 'bdc08095-d80f-4974-aa69-a41d01a66748';

export type FormSchemaElementMap = Map<string, IVeoFormSchemaItem>;

export const PROVIDE_KEYS = {
  formSchemaElementMap: 'formSchemaElementMap'
};
</script>

<script setup lang="ts">
import { PropType } from 'vue';
import { v5 as UUIDv5 } from 'uuid';

import { IVeoFormSchemaItem } from '~~/types/VeoTypes';
import { JsonPointer } from 'json-ptr';
import { IPlaygroundElement } from './Element.vue';

// TODO: 1. Backlog integrieren 2. Delete/Edit einbauen

const props = defineProps({
  modelValue: {
    type: Object as PropType<IVeoFormSchemaItem>,
    default: () => ({
      type: "Layout",
      options: {
        format: "group",
        direction: "vertical"
      },
      elements: []
    })
  }
});

// UUID Map stuff
const formSchemaElementMap = reactive<FormSchemaElementMap>(new Map<string, IVeoFormSchemaItem>());
const playgroundElements = ref<IPlaygroundElement | undefined>(undefined);

provide(PROVIDE_KEYS.formSchemaElementMap, formSchemaElementMap);

const getFormSchemaElementName = (formSchemaElement: IVeoFormSchemaItem, pointer: string) => {
  switch(formSchemaElement.type) {
    case 'Control':
      return formSchemaElement.scope as string;
    case 'Widget':
      return formSchemaElement.name as string;
    default:
      return pointer;
  }
};

const addElementToMap = (formSchemaElement: IVeoFormSchemaItem, pointer: string) => {
  const uuid = UUIDv5(getFormSchemaElementName(formSchemaElement, pointer), FORMSCHEMA_PLAYGROUND_NAMESPACE);
  formSchemaElementMap.set(uuid, formSchemaElement); // Add formSchema element to uuid map
  if(pointer === '#') {
    playgroundElements.value = { id: uuid, children: [], readonly: true };
  } else {
    JsonPointer.set(playgroundElements.value, pointer, { id: uuid, children: [] }, true); // Add to playground elements to be displayed
  }

  (formSchemaElement.elements || []).forEach((child, childIndex) => {
    addElementToMap(child, `${pointer}/children/${childIndex}`);
  });
};

const initPlayground = (formSchemaRoot: IVeoFormSchemaItem) => {
  formSchemaElementMap.clear();
  addElementToMap(formSchemaRoot, '#');
};
initPlayground(props.modelValue); // Call once as soon as the component gets initialized to create the map

// Manipulation of playground
const getParentPointer = (childPointer: string) => {
  const parts = childPointer.split('/');
  parts.pop(); // Remove index of child pointer
  parts.pop(); // Move from property of parent object to parent object
  return parts.join('/');
};

const onAddElement = (elementPointer: string, element: IPlaygroundElement) => {
  const newIndex = parseInt(elementPointer.split('/').pop() as string);

  const parent = JsonPointer.get(playgroundElements.value, getParentPointer(elementPointer)) as IPlaygroundElement;

  // Add at new position
  parent.children.splice(newIndex, 0, element);
};

const onRemoveElement = (elementPointer: string, removeFromSchemaElementMap = false) => {
  const elementIndexToRemove = parseInt(elementPointer.split('/').pop() as string);
  const parentPointer = getParentPointer(elementPointer);

  const element = JsonPointer.get(playgroundElements.value, elementPointer) as IPlaygroundElement;
  const parent = JsonPointer.get(playgroundElements.value, parentPointer) as IPlaygroundElement;

  // Remove from playground elements
  parent.children.splice(elementIndexToRemove, 1);
  // Remove from form schema element map
  if(removeFromSchemaElementMap) {
    formSchemaElementMap.delete(element.id);
  }
};

const onMoveElement = (oldElementPointer: string, newElementPointer: string) => {
  const element = JsonPointer.get(playgroundElements.value, oldElementPointer) as IPlaygroundElement;

  onRemoveElement(oldElementPointer);
  onAddElement(newElementPointer, element);
};
</script>
