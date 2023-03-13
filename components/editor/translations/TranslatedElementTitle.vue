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
  <title12 />
</template>

<script setup lang="ts">
import { PropType, Ref } from 'vue';

import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~~/pages/[unit]/domains/[domain]/editor/formschema.vue';
import { IVeoFormSchemaItem, IVeoTranslationCollection } from '~~/types/VeoTypes';

const props = defineProps({
  formSchemaItem: {
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
  }
});

const slots = useSlots();

// Find out item name
const language = inject<Ref<string>>(FORMSCHEMA_PROVIDE_KEYS.language);
const translations = inject<Ref<Record<string, IVeoTranslationCollection>>>(FORMSCHEMA_PROVIDE_KEYS.translations);

const translationString = computed(() => props.formSchemaItem.text || props.formSchemaItem.options?.label || props.formSchemaItem.scope);

// Only internationalized if starts with #lang/
const itemName = computed(() => {
  if(!language?.value || !translationString.value) {
    return undefined;
  }

  let sanitizedKey;
  if(translationString.value.startsWith('#lang/')) {
    sanitizedKey = translationString.value.replace('#lang/', '');
  } else {
    return translationString.value;
  }

  return translations?.value?.[language.value]?.[sanitizedKey] || undefined;
});

const title12 = computed(() => (itemName.value || !props.hideIfMissing) ? () => [
  h(props.tag, itemName.value ?? translationString.value),
  slots.default?.({ translatedValue: itemName.value })
] : null);
</script>
