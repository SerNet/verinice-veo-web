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
    <v-text-field
      v-model="modelValue"
      :label="label"
      variant="underlined"
      clearable
      :placeholder="noValueText"
      :prepend-inner-icon="icon"
      @update:model-value="onInput"
    />
    <div class="height: 1em">
      <v-icon
        start
        :icon="mdiTranslate"
      /> {{ t('displayedAs', [displayedValue, source]) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiAlphabeticalVariant, mdiLabelOutline, mdiTranslate } from '@mdi/js';
import { cloneDeep } from 'lodash';
import { PropType, Ref } from 'vue';

import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~~/pages/[unit]/domains/[domain]/editor/formschema.vue';
import { IVeoFormSchemaItem, IVeoTranslationCollection } from '~~/types/VeoTypes';

const props = defineProps({
  formSchemaElement: {
    type: Object as PropType<IVeoFormSchemaItem>,
    required: true
  }
});

const emit = defineEmits<{
  (event: 'set-translation', translatedLabelKey: string, newValue: string | undefined): void
  (event: 'update:form-schema-element', formSchemaElement: IVeoFormSchemaItem): void
}>();

const { t } = useI18n();

const language = inject<Ref<string>>(FORMSCHEMA_PROVIDE_KEYS.language);
const formSchemaTranslations = inject<Ref<Record<string, IVeoTranslationCollection>>>(FORMSCHEMA_PROVIDE_KEYS.formSchemaTranslations);
const objectSchemaTranslations = inject<Ref<Record<string, IVeoTranslationCollection>>>(FORMSCHEMA_PROVIDE_KEYS.objectSchemaTranslations);

const label = computed(() => props.formSchemaElement.type === 'Label' ? t('text') : t('label'));
const noValueText = computed(() => props.formSchemaElement.type === 'Label' ? t('noText') : t('noLabel'));

const icon = computed(() => props.formSchemaElement.type === 'Label' ? mdiAlphabeticalVariant : mdiLabelOutline);

const labelExists = computed(() => !!props.formSchemaElement.text || !!props.formSchemaElement.options?.label);
const isTranslatedLabel = computed(() => (props.formSchemaElement.text || props.formSchemaElement.options?.label)?.startsWith('#lang/') || false);
const translatedLabelKey = computed(() => (props.formSchemaElement.text || props.formSchemaElement.options?.label || '').replace('#lang/', ''));

const displayedValue = computed(() => {
  if(isTranslatedLabel.value && language?.value && formSchemaTranslations?.value?.[language.value]?.[translatedLabelKey.value]) {
    return formSchemaTranslations?.value?.[language.value]?.[translatedLabelKey.value];
  }
  if (language?.value && objectSchemaTranslations?.value?.[language.value]?.[translatedLabelKey.value]) {
    return objectSchemaTranslations?.value?.[language.value]?.[translatedLabelKey.value];
  }
  if(labelExists.value) {
    return props.formSchemaElement.text || props.formSchemaElement.options?.label;
  }

  return translatedLabelKey.value;
});

const source = computed(() => {
  if(isTranslatedLabel.value && language?.value && formSchemaTranslations?.value?.[language.value]?.[translatedLabelKey.value]) {
    return t('source.formSchemaTranslations');
  }
  if(language?.value && objectSchemaTranslations?.value?.[language.value]?.[translatedLabelKey.value]) {
    return t('source.objectSchema');
  }
  if(labelExists.value) {
    return t('source.formSchema');
  }
  
  return t('source.objectSchemaKey');
});

// Model value stuff
const getElementName = () => {
  if(!language?.value || !labelExists.value) {
    return undefined;
  }

  if(isTranslatedLabel.value) {
    return formSchemaTranslations?.value?.[language.value]?.[translatedLabelKey.value];
  } else {
    return props.formSchemaElement.text || props.formSchemaElement.options?.label;
  }
};

const modelValue = ref();
watch(() => props.formSchemaElement, () => {
  modelValue.value = getElementName();
}, { deep: true, immediate: true });

const onInput = (newValue: string) => {
  if(isTranslatedLabel.value) {
    emit('set-translation', translatedLabelKey.value, newValue);
  } else {
    const currentData = cloneDeep(props.formSchemaElement);
    if(props.formSchemaElement.type === 'Label') {
      currentData.text = newValue;
    } else {
      if(!currentData.options) {
        currentData.options = {};
      }
      currentData.options.label = newValue;
    }
    emit('update:form-schema-element', currentData);
  }
};
</script>

<i18n>
{
  "en": {
    "displayedAs": "Displayed as \"{0}\" (source: {1})",
    "label": "Label",
    "noLabel": "No label",
    "noText": "No text",
    "source": {
      "formSchema": "form schema",
      "formSchemaTranslations": "form schema translations",
      "objectSchema": "object schema translations",
      "objectSchemaKey": "attribute key"
    },
    "text": "Text"
  },
  "de": {
    "displayedAs": "Angezeigt als \"{0}\" (Quelle: {1})",
    "label": "Beschriftung",
    "noLabel": "Keine Beschriftung",
    "noText": "Kein Text",
    "source": {
      "formSchema": "Formschema",
      "formSchemaTranslations": "Formschema Übersetzungen",
      "objectSchema": "Objektschema Übersetzungen",
      "objectSchemaKey": "Attribut-Key"
    },
    "text": "Text"
  }
}
</i18n>
