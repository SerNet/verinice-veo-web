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
    @form-schema-elements-modified="onFormSchemaModified(playgroundElements)"
    @set-translations="emit('set-translations', $event)"
  />
</template>

<script lang="ts">
export const FORMSCHEMA_PLAYGROUND_NAMESPACE = 'bdc08095-d80f-4974-aa69-a41d01a66748';

export type FormSchemaElementMap = Map<string, IVeoFormSchemaItem>;

export const PROVIDE_KEYS = {
  FORM_SCHEMA_ELEMENT_MAP: 'formSchemaElementMap'
};
</script>

<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { JsonPointer } from 'json-ptr';
import { v5 as UUIDv5, v4 as UUIDv4 } from 'uuid';

import { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import { IPlaygroundElement } from './Element.vue';
import { PENDING_TRANSLATIONS } from './EditElementDialog.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: IVeoFormSchemaItem;
  }>(),
  {
    modelValue: () => ({
      type: 'Layout',
      options: {
        format: 'group',
        direction: 'vertical'
      },
      elements: []
    })
  }
);

const emit = defineEmits<{
  (event: 'update:model-value', formSchema: IVeoFormSchemaItem): void;
  (event: 'set-translations', translations: PENDING_TRANSLATIONS): void;
}>();

// UUID Map stuff
const formSchemaElementMap = reactive<FormSchemaElementMap>(new Map<string, IVeoFormSchemaItem>());
const playgroundElements = ref<IPlaygroundElement | undefined>(undefined);

provide(PROVIDE_KEYS.FORM_SCHEMA_ELEMENT_MAP, formSchemaElementMap);

const isCustomLinkAttribute = (element: IVeoFormSchemaItem | undefined, parent: IVeoFormSchemaItem | undefined) => {
  if (!element?.scope) {
    return false;
  }
  return (
    element.scope.includes('/properties/attributes/properties') &&
    (!!element.scope.startsWith('#/properties/links') || !!parent?.scope?.startsWith('#/properties/links'))
  );
};

const getFormSchemaElementName = (formSchemaElement: IVeoFormSchemaItem, pointer: string) => {
  switch (formSchemaElement.type) {
    case 'Control':
      return formSchemaElement.scope as string;
    case 'Widget':
      return formSchemaElement.name as string;
    default:
      return pointer;
  }
};

const addElementToMap = (
  formSchemaElement: IVeoFormSchemaItem,
  pointer: string,
  parent: IVeoFormSchemaItem | undefined
) => {
  // Turn relative custom link attribute scopes into absolute scopes. This is undone in buildFormSchemaItem
  if (isCustomLinkAttribute(formSchemaElement, parent) && !formSchemaElement?.scope?.startsWith('#/properties/links')) {
    formSchemaElement.scope = `${parent?.scope}/items/${formSchemaElement.scope?.replace('#/', '')}`;
  }

  const uuid = UUIDv5(getFormSchemaElementName(formSchemaElement, pointer), FORMSCHEMA_PLAYGROUND_NAMESPACE);
  formSchemaElementMap.set(uuid, cloneDeep(formSchemaElement)); // Add formSchema element to uuid map
  if (pointer === '#') {
    playgroundElements.value = { id: uuid, children: [], readonly: true };
  } else {
    JsonPointer.set(playgroundElements.value, pointer, { id: uuid, children: [] }, true); // Add to playground elements to be displayed
  }

  (formSchemaElement.elements || []).forEach((child, childIndex) => {
    addElementToMap(child, `${pointer}/children/${childIndex}`, formSchemaElement);
  });
};

const initPlayground = (formSchemaRoot: IVeoFormSchemaItem) => {
  formSchemaElementMap.clear();
  addElementToMap(formSchemaRoot, '#', undefined);
};
initPlayground(cloneDeep(props.modelValue)); // Call once as soon as the component gets initialized to create the map

const buildFormSchemaItem = (element: IPlaygroundElement, parentElement: IPlaygroundElement | undefined) => {
  const formSchemaElement = cloneDeep(formSchemaElementMap.get(element.id) as IVeoFormSchemaItem);
  const parentFormSchemaElement = parentElement ? formSchemaElementMap.get(parentElement.id) : undefined;

  // Undo absolute path scopes for link attributes (See addAllCustomLinkAttributes())
  if (isCustomLinkAttribute(formSchemaElement, parentFormSchemaElement)) {
    formSchemaElement.scope = `#/properties/attributes/properties${formSchemaElement.scope?.split(
      '/properties/attributes/properties'
    )[1]}`;
  }
  formSchemaElement.elements = 'elements' in formSchemaElement ? [] : undefined;

  for (const child of element.children) {
    formSchemaElement.elements?.push(buildFormSchemaItem(child, element));
  }

  return formSchemaElement;
};

const onFormSchemaModified = (newValue: IPlaygroundElement | undefined) => {
  if (!newValue) {
    return;
  }
  emit('update:model-value', buildFormSchemaItem(newValue, undefined));
};

watch(() => playgroundElements.value, onFormSchemaModified, { deep: true });

// Manipulation of playground
const getParentPointer = (childPointer: string) => {
  const parts = childPointer.split('/');
  parts.pop(); // Remove index of child pointer
  parts.pop(); // Move from property of parent object to parent object
  return parts.join('/');
};

const isFormElement = (element: IPlaygroundElement | IVeoFormSchemaItem): element is IVeoFormSchemaItem =>
  'type' in element;

const onAddElement = (elementPointer: string, element: IPlaygroundElement | IVeoFormSchemaItem) => {
  // onAddElement can either be called from within the playground or if the user drags a backlog item to the playground, so we have to check which object we got
  if (isFormElement(element)) {
    // We use v4 as a fallback here, as there is no pointer yet, as this elements gets added
    const uuid = UUIDv5(getFormSchemaElementName(element, UUIDv4()), FORMSCHEMA_PLAYGROUND_NAMESPACE);
    formSchemaElementMap.set(uuid, cloneDeep(element)); // Add formSchema element to uuid map
    element = { id: uuid, children: [] };
  }

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
  if (removeFromSchemaElementMap) {
    // Recursive function, as if we delete an element from the playground that contains children, all child elements should also get removed
    const deleteElement = (element: IPlaygroundElement) => {
      for (const child of element.children) {
        deleteElement(child);
      }
      formSchemaElementMap.delete(element.id);
    };
    deleteElement(element);
  }
};

const onMoveElement = (oldElementPointer: string, newElementPointer: string) => {
  const element = JsonPointer.get(playgroundElements.value, oldElementPointer) as IPlaygroundElement;

  onRemoveElement(oldElementPointer);
  onAddElement(newElementPointer, element);
};
</script>
