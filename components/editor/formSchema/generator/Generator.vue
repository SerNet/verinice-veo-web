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
import { UISchemaElement } from '~/types/UISchema';
import { IVeoFormSchemaItem, IVeoFormSchemaTranslationCollection, IVeoTranslationCollection } from '~/types/VeoTypes';
import { IVeoFormsElementDefinition } from '~/components/dynamic-form/types';
import { cloneDeep } from 'lodash';

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

const onComponentMoved = (elements: any, formSchemaPointer: string) => {
  const data = cloneDeep(props.modelValue);
  console.log(formSchemaPointer, elements, data);
  if(formSchemaPointer === '#') {
    data.elements = elements;
  } else {
    JsonPointer.set(data, formSchemaPointer, elements);
  }
  emit('update:model-value', data);
};

const createComponent = (element: UISchemaElement, formSchemaPointer: string, elementLevel: number) => {
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
