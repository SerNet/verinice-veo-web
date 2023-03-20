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
  <v-select
    v-model="usedLinkAttributes"
    :label="t('displayedAttributes')"
    :items="availableLinkAttributes"
    multiple
    :prepend-inner-icon="mdiListBoxOutline"
    variant="underlined"
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item
        v-bind="itemProps"
        :active="usedLinkAttributes.includes(item.value)"
        two-line
        style="max-width: 500px"
      >
        <template #prepend>
          <v-icon :icon="usedLinkAttributes.includes(item.value) ? mdiCheckboxMarked : mdiCheckboxBlankOutline" />
        </template>
        <v-list-item-title>
          <EditorTranslationsTranslatedElementTitle :form-schema-element="<any>linksFieldAttributeMap.get(item.value)" />
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ linksFieldAttributeMap.get(item.value)?.scope }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
    <template #selection="{ item }">
      <EditorTranslationsTranslatedElementTitle
        v-if="linksFieldAttributeMap.get(item.value)"
        :form-schema-element="<any>linksFieldAttributeMap.get(item.value)"
      />
    </template>
  </v-select>
  <Draggable
    :v-model="playground"
    handle=".handle"
    item-key="id"
    :group="{ pull: false, put: false }"
    :class="$style.dragarea"
  >
    <template #item="{ element, index }">
      <EditorFormSchemaPlaygroundElement
        :playground-element="element"
        :pointer="`#/${index}`"
        @form-schema-elements-modified="bla"
        @set-translations="emit('set-translations', $event)"
      />
    </template>
  </Draggable>
</template>

<script setup lang="ts">
import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiListBoxOutline } from '@mdi/js';
import { JSONSchema7 } from 'json-schema';
import { PropType } from 'vue';
import { v5 as UUIDv5 } from 'uuid';
import Draggable from 'vuedraggable';

import { IVeoFormSchemaItem } from '~~/types/VeoTypes';
import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~~/pages/[unit]/domains/[domain]/editor/formschema.vue';
import { FormSchemaElementMap, FORMSCHEMA_PLAYGROUND_NAMESPACE, PROVIDE_KEYS as PLAYGROUND_PROVIDE_KEYS } from '../Playground.vue';
import { PENDING_TRANSLATIONS } from '../EditElementDialog.vue';
import { merge } from 'lodash';

const props = defineProps({
  formSchemaElement: {
    type: Object as PropType<IVeoFormSchemaItem>,
    required: true
  },
  objectSchemaElement: {
    type: Object as PropType<JSONSchema7>,
    required: true
  }
});

const emit = defineEmits<{
  (event: 'update:form-schema-element', formSchemaElement: IVeoFormSchemaItem): void
  (event: 'set-translations', translations: PENDING_TRANSLATIONS): void
}>();

const { t } = useI18n();

// Create a map containing all possible link attributes once the component is mounted (as we are in the form schema editor, the amount of custom links won't change)
const linksFieldAttributeMap = reactive<FormSchemaElementMap>(new Map<string, IVeoFormSchemaItem>());
for(const [key, _attribute] of Object.entries((props.objectSchemaElement.items as any)?.properties?.attributes?.properties || {})) {
  const scope = `#/properties/attributes/properties/${key}`;
  const uuid = UUIDv5(scope, FORMSCHEMA_PLAYGROUND_NAMESPACE);
  linksFieldAttributeMap.set(uuid, {
    type: 'Control',
    scope,
    options: {
      label: `#lang/${key}`
    }
  });
}
const availableLinkAttributes = computed(() => [...linksFieldAttributeMap].map(([uuid, _element]) => uuid));
const usedLinkAttributes = ref<string[]>([]);
watch(() => props.formSchemaElement.elements, (newValue) => {
  if(!newValue) {
    return;
  }
  usedLinkAttributes.value = [];
  for(const element of newValue) {
    const uuid = UUIDv5(element.scope as string, FORMSCHEMA_PLAYGROUND_NAMESPACE); // we can generate a new uuid here, as UUIDv5 will generate the same uuid for the same name
    usedLinkAttributes.value.push(uuid);
    linksFieldAttributeMap.set(uuid, merge(linksFieldAttributeMap.get(uuid), { options: element.options }));
  }
}, { deep: true, immediate: true });

const playground = computed({
  get: () => {
    console.log(usedLinkAttributes.value.map((attribute) => linksFieldAttributeMap.get(attribute)).filter((attribute) => attribute) as IVeoFormSchemaItem[]);
    return usedLinkAttributes.value.map((attribute) => linksFieldAttributeMap.get(attribute)).filter((attribute) => attribute) as IVeoFormSchemaItem[];
  },
  set: (newValue) => emit('update:form-schema-element', { ...props.formSchemaElement, elements: newValue })
});

const bla = ($event: any) => console.log(123, $event);
</script>

<i18n>
{
  "en": {
    "displayedAttributes": "Displayed attributes"
  },
  "de": {
    "displayedAttributes": "Angezeigte Felder"
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
