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
  <translatedTitle v-if="translatedTitle" />
</template>

<script lang="ts">
export enum TRANSLATION_SOURCE {
  OBJECTSCHEMA,
  FORMSCHEMA,
  UNSPECIFIED
}
</script>

<script setup lang="ts">
import { PropType, Ref } from 'vue';

import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~~/pages/[unit]/domains/[domain]/editor/formschema.vue';
import { IVeoFormSchemaItem, IVeoTranslationCollection } from '~~/types/VeoTypes';

const props = defineProps({
  formSchemaElement: {
    type: Object as PropType<IVeoFormSchemaItem>,
    required: true
  },
  tag: {
    type: String,
    default: 'span'
  },
  hideIfMissing: {
    type: Boolean,
    default: false
  },
  source: {
    type: Number as PropType<TRANSLATION_SOURCE>,
    default: TRANSLATION_SOURCE.UNSPECIFIED
  }
});

const slots = useSlots();

// Find out element name
const language = inject<Ref<string>>(FORMSCHEMA_PROVIDE_KEYS.language);

const formSchemaTranslations = inject<Ref<Record<string, IVeoTranslationCollection>>>(FORMSCHEMA_PROVIDE_KEYS.formSchemaTranslations);
const objectSchemaTranslations = inject<Ref<Record<string, IVeoTranslationCollection>>>(FORMSCHEMA_PROVIDE_KEYS.objectSchemaTranslations);

const translationString = computed(() => props.formSchemaElement.text || props.formSchemaElement.options?.label || props.formSchemaElement.scope);

// Only internationalized if starts with #lang/
const elementName = computed(() => {
  if(!language?.value || !translationString.value) {
    return undefined;
  }

  let sanitizedKey;
  if(translationString.value.startsWith('#lang/')) {
    sanitizedKey = translationString.value.replace('#lang/', '');
  } else {
    return translationString.value;
  }

  if((props.source === TRANSLATION_SOURCE.UNSPECIFIED || props.source === TRANSLATION_SOURCE.FORMSCHEMA) && formSchemaTranslations?.value?.[language.value]?.[sanitizedKey]) {
    return formSchemaTranslations?.value?.[language.value]?.[sanitizedKey];
  }

  if((props.source === TRANSLATION_SOURCE.UNSPECIFIED || props.source === TRANSLATION_SOURCE.OBJECTSCHEMA) && objectSchemaTranslations?.value?.[language.value]?.[sanitizedKey]) {
    return objectSchemaTranslations?.value?.[language.value]?.[sanitizedKey];
  }

  return undefined;
});

const translatedTitle = computed(() => (elementName.value || !props.hideIfMissing) ? () => [
  h(props.tag, elementName.value ?? translationString.value),
  slots.default?.({ translatedValue: elementName.value })
] : undefined);
</script>
