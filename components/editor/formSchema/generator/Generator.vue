<!--
   - verinice.veo web
   - Copyright (C) 2021 Davit Svandize, Jonas Heitmann
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
  <component :is="render" />
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { JSONSchema7 } from 'json-schema';
import { JsonPointer } from 'json-ptr';

import FseLabel from './elements/Label.vue';
import FseControl from './elements/Control.vue';
import FseLayout from './elements/Layout.vue';
import VeoFseWidget from './elements/Widget.vue';
import { IVeoFormSchemaTranslationCollection, IVeoTranslationCollection } from '~/types/VeoTypes';
import { IVeoFormsElementDefinition } from '~/components/dynamic-form/types';
import { cloneDeep, omit } from 'lodash';
import { IVeoFormSchemaItem } from '~~/composables/api/queryDefinitions/forms';

type FormSchemaGeneratorAction = IVeoFormSchemaItem & { action: 'add' | 'remove'; index: number; newPointer?: string }

const WIDGETS: IVeoFormsElementDefinition[] = [];

const props = defineProps({
  schema: {
    type: Object as PropType<JSONSchema7>,
    required: true
  },
  modelValue: {
    type: Object as PropType<IVeoFormSchemaItem>,
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
  language: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:model-value']);

const { locale } = useI18n();
const attrs = useAttrs();

const pendingActions = ref<FormSchemaGeneratorAction[]>([]);

// Only gets executed once per tick, so even though an element gets marked as to remove and to add, the watch function will only get called once.
watch(() => pendingActions.value, (newValue) => {
  // Early exit if there are no pending actions
  if(!newValue.length) {
    return;
  }
  // We clone deep just in case to not accidentially trigger an update later on
  const localPendingActions = cloneDeep(newValue);
  const localModelValue = cloneDeep(props.modelValue);

  // FORMSCHEMA POINTER AUF NEUEN POINTER SETZEN!!! IRGENDWIE IN ONCOMPONENTMOVED RAUSBEKOMMEN BASIEREND AUF EXISTIERENDEN ELEMENTEN UND DEREN POINTER + POSI VON NEUEM ELEMENT IN ARRAY
  for (const action of localPendingActions) {
    // Get other actions that reference an item on the same level their reference will become invalid as soon as data is inserted/removed
    const parentParts = action.formSchemaPointer.split('/');
    const parentPointerLength = parentParts.length;
    parentParts.pop();
    const parentPointer = parentParts.join('/');
    const affectedActions = localPendingActions.filter((action) => action.formSchemaPointer.startsWith(parentPointer) && action.formSchemaPointer !== parentPointer);
    for(const affectedAction of affectedActions) {
      // Get the part of the pointer that has to change and it's current value
      const affectedActionParts = affectedAction.formSchemaPointer.split('/');
      const affectedActionPointerAffectedPart = parentPointerLength - 1;
      const affectedActionPointerAffectedPartValue = parseInt(affectedActionParts[affectedActionPointerAffectedPart]);
      // If the affected actions index is higher than where the item should be inserted, the action is actually affected and needs to be manipulated.
      if(affectedActionPointerAffectedPart >= action.index) {
        if(action.action === 'add') {
          affectedActionParts[affectedActionPointerAffectedPart] = `${affectedActionPointerAffectedPartValue + 1}`;
        } else {
          affectedActionParts[affectedActionPointerAffectedPart] = `${affectedActionPointerAffectedPartValue - 1}`;
        }
        affectedAction.formSchemaPointer = affectedActionParts.join('/');
      }
    }

    const items = JsonPointer.get(localModelValue, parentPointer) as IVeoFormSchemaItem['elements'];
    if(action.action === 'add') {
      items.splice(action.index, 0, omit(action, 'index', 'action', 'formSchemaPointer'));
    } else {
      items.splice(action.index, 1);
    }
    JsonPointer.set(localModelValue, parentPointer, items);
  }

  // Reset array after all actions have been executed
  emit('update:model-value', localModelValue);
  pendingActions.value = [];
}, { deep: true });

const getMissingFormSchemaItem = (completeSet: IVeoFormSchemaItem[], incompleteSet: IVeoFormSchemaItem[]): IVeoFormSchemaItem & { index: number } | undefined => {
  const index = completeSet.findIndex((entry1) => !incompleteSet.find((entry2) => entry2.formSchemaPointer === entry1.formSchemaPointer));

  if(index === -1) {
    return undefined;
  }

  return { ...completeSet[index], index };
};

const onComponentMoved = (affectedLayout: IVeoFormSchemaItem, affectedLayoutformSchemaPointer: string) => {
  let data = cloneDeep(props.modelValue);

  const affectedLayoutCurrentState = JsonPointer.get(data, affectedLayoutformSchemaPointer) as IVeoFormSchemaItem;
  // If one of the affected form elements has no children, no layout got modified, so we quit (this case should never happen, but better save than sorry)
  if(!affectedLayoutCurrentState.elements || !affectedLayout.elements) {
    return;
  }

  // If the amount of children stays the same, nothing complex is happening, so we just push the update
  if(affectedLayoutCurrentState.elements.length === affectedLayout.elements.length) {
    if(affectedLayoutformSchemaPointer === '#') {
      data = cloneDeep(omit(affectedLayout, 'formSchemaPointer'));
    } else {
      JsonPointer.set(data, affectedLayoutformSchemaPointer, omit(affectedLayout, 'formSchemaPointer'));
    }
    emit('update:model-value', data);
    return;
  }

  // If the current element count is bigger than the future one, an element got removed, so we find it and add its pointer to the actions
  if(affectedLayoutCurrentState.elements.length < affectedLayout.elements.length) {
    const mssingFormSchemaItem = getMissingFormSchemaItem(affectedLayout.elements, affectedLayoutCurrentState.elements);
    pendingActions.value.push({ ...mssingFormSchemaItem, action: 'add', formSchemaPointer: `${affectedLayoutformSchemaPointer}/elements/${mssingFormSchemaItem.index}` });
  } else { // If the current element count is bigger than the future one, an element got added, so we find out where and how this changes other operations
    pendingActions.value.push({ ...getMissingFormSchemaItem(affectedLayoutCurrentState.elements, affectedLayout.elements), action: 'remove' });
  }
};

const createComponent = (element: IVeoFormSchemaItem, formSchemaPointer: string, elementLevel: number) => {
  // We add a unique pointer to the element so we can find out which element got moved if this happens
  element.formSchemaPointer = formSchemaPointer;
  for(const index in element.elements || []) {
    element.elements[index].formSchemaPointer = `${formSchemaPointer}/elements/${index}`;
  }
  switch (element.type) {
    case 'Layout':
      return h(
        FseLayout,
        {
          
          options: element.options,
          modelValue: element,
          formSchemaPointer,
          level: elementLevel,
          name: element.options?.label?.replace('#lang/', ''),
          customTranslations: props.customTranslations,
          language: props.language,
          createFunction: createComponent,
          ...attrs,
          'onUpdate:model-value': (elements) => onComponentMoved(elements, formSchemaPointer)
        }
      );
    case 'Control': {
      let partOfProps: { [key: string]: any } = {
        name: undefined,
        schema: {},
        formSchemaPointer,
        generalTranslation: {},
        customTranslations: {}
      };

      if (element.scope) {
        const elementName = element.scope.split('/').pop() as string;
        const elementSchema = JsonPointer.get(props.schema, element.scope) as any;

        partOfProps = {
          ...partOfProps,
          modelValue: element,
          name: elementName,
          schema: elementSchema,
          generalTranslation: props.generalTranslation,
          customTranslations: props.customTranslations,
          language: props.language
        };
      }
      return h(FseControl, {
        elements: element.elements,
        options: element.options,
        ...partOfProps,
        scope: element.scope || '',
        ...attrs
      });
    }
    case 'Label':
      return h(FseLabel, {
        options: element.options,
        modelValue: element,
        name: element.text.replace('#lang/', ''),
        text: element.text,
        formSchemaPointer,
        customTranslations: props.customTranslations,
        language: props.language,
        ...attrs
      });
    case 'Widget':
      // eslint-disable-next-line no-case-declarations
      const widgetDefinition = WIDGETS.find((widget) => element.name === widget.code);
      if (!widgetDefinition) {
        // eslint-disable-next-line no-console
        console.warn(`VeoFseGenerator:: ${element.name} not found`);
        return null as any;
      }

      return h(VeoFseWidget, {
        code: widgetDefinition.code,
        name: widgetDefinition.name,
        formSchemaPointer,
        description: widgetDefinition.description[locale.value] || Object.values(widgetDefinition.description)[0],
        ...attrs
      });
  }
};

const render = () => props.modelValue ? createComponent(props.modelValue, '#', 0) : null;
</script>
