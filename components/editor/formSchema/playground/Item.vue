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
    :playground-item="playgroundItem"
    :form-schema-item="formSchemaItem"
    :item-name="itemName"
    style="min-width: 300px;"
  >
    <EditorFormSchemaPlaygroundItem
      v-for="child of props.playgroundItem.children"
      :key="child.id"
      :playground-item="child"
    />
  </component>
</template>

<script lang="ts">
export interface IPlaygroundItem {
  id: string;
  children: IPlaygroundItem[];
  readonly?: boolean;
}
</script>

<script setup lang="ts">
import { PropType, Ref } from 'vue';

import { FormSchemaItemMap, PROVIDE_KEYS as PLAYGROUND_PROVIDE_KEYS } from './Playground.vue';
import ControlItem from './ControlItem.vue';
import LabelItem from './LabelItem.vue';
import LayoutItem from './LayoutItem.vue';
import { IVeoTranslationCollection } from '~~/types/VeoTypes';
import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~~/pages/[unit]/domains/[domain]/editor/formschema.vue';

const props = defineProps({
  playgroundItem: {
    type: Object as PropType<IPlaygroundItem>,
    required: true
  }
});

const { t } = useI18n();

const formSchemaItemMap = inject<FormSchemaItemMap>(PLAYGROUND_PROVIDE_KEYS.formSchemaItemMap);

const formSchemaItem = computed(() => formSchemaItemMap?.get(props.playgroundItem.id));

const fittingComponent = computed(() => {
  switch(formSchemaItem.value?.type) {
    case 'Control':
      return ControlItem;
    case 'Layout':
      return LayoutItem;
    case 'Label':
      return LabelItem;
    case 'Widget':
      return h('div', 'Widget isn\'t implemented yet.');
    default:
      return h('div', t('componentNotFound', [props.playgroundItem.id, formSchemaItem.value?.type]));
  }
});

// Find out item name
const language = inject<Ref<string>>(FORMSCHEMA_PROVIDE_KEYS.language);
const translations = inject<Ref<Record<string, IVeoTranslationCollection>>>(FORMSCHEMA_PROVIDE_KEYS.translations);

// Only internationalized if starts with #lang/
const itemName = computed(() => {
  const label = formSchemaItem.value?.text || formSchemaItem.value?.options?.label || formSchemaItem.value?.scope;

  if(!language?.value || !label) {
    return;
  }

  let key;
  if(label.startsWith('#lang/')) {
    key = label.replace('#lang/', '');
  } else {
    return label;
  }

  return translations?.value?.[language.value]?.[key] || key;
});
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
