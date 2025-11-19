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
      data-component-name="form-element-title"
      :label="label"
      variant="underlined"
      :placeholder="noValueText"
      :prepend-inner-icon="icon"
      @update:model-value="onInput"
    />
    <div class="height: 1em">
      <v-icon start :icon="mdiTranslate" />
      {{ t('displayedAs', [displayedValue, source]) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiAlphabeticalVariant, mdiLabelOutline, mdiTranslate } from '@mdi/js';
import { cloneDeep } from 'lodash';
import { v4 as UUIDv4 } from 'uuid';

import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~/pages/[unit]/domains/[domain]/editor/formschema.vue';
import type { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import type { IEditorTranslations } from '~/components/editor/translations/types';
import { TRANSLATION_SOURCE } from '~/components/editor/translations/types';

const props = withDefaults(
  defineProps<{
    formSchemaElement: IVeoFormSchemaItem;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: 'set-translation', translatedLabelKey: string, newValue: string | undefined): void;
  (event: 'update:form-schema-element', formSchemaElement: IVeoFormSchemaItem): void;
}>();

const { t } = useI18n();

const language = inject<Ref<string>>(FORMSCHEMA_PROVIDE_KEYS.EDITOR_LANGUAGE);
const translations = inject<Ref<IEditorTranslations>>(FORMSCHEMA_PROVIDE_KEYS.TRANSLATIONS);

const label = computed(() => (props.formSchemaElement.type === 'Label' ? t('text') : t('label')));
const noValueText = computed(() => (props.formSchemaElement.type === 'Label' ? t('noText') : t('noLabel')));

const icon = computed(() => (props.formSchemaElement.type === 'Label' ? mdiAlphabeticalVariant : mdiLabelOutline));

const labelExists = computed(() => !!props.formSchemaElement.text || !!props.formSchemaElement.options?.label);
const isTranslatedLabel = computed(() =>
  (props.formSchemaElement.text || props.formSchemaElement.options?.label || '')?.startsWith('#lang/')
);
const translatedLabelKey = computed(() =>
  (props.formSchemaElement.text || props.formSchemaElement.options?.label || '').replace('#lang/', '')
);

const formSchemaTranslation = computed(() =>
  language?.value ?
    translations?.value?.[translatedLabelKey.value]?.[TRANSLATION_SOURCE.FORMSCHEMA]?.[language.value]
  : undefined
);
const objectSchemaTranslation = computed(() =>
  language?.value ?
    translations?.value?.[translatedLabelKey.value]?.[TRANSLATION_SOURCE.OBJECTSCHEMA]?.[language.value]
  : undefined
);

const displayedValue = computed(() => {
  if (isTranslatedLabel.value && formSchemaTranslation.value) {
    return formSchemaTranslation.value;
  }
  if (objectSchemaTranslation.value) {
    return objectSchemaTranslation.value;
  }
  if (labelExists.value) {
    return props.formSchemaElement.text || props.formSchemaElement.options?.label;
  }

  return translatedLabelKey.value;
});

const source = computed(() => {
  if (isTranslatedLabel.value && formSchemaTranslation.value) {
    return t('source.formSchemaTranslations');
  }
  if (objectSchemaTranslation.value) {
    return t('source.objectSchema');
  }
  if (labelExists.value) {
    return t('source.formSchema');
  }

  return t('source.objectSchemaKey');
});

// Model value stuff
const getElementName = () => {
  if (!language?.value || !labelExists.value) {
    return undefined;
  }

  if (isTranslatedLabel.value) {
    return formSchemaTranslation.value;
  } else {
    return props.formSchemaElement.text || props.formSchemaElement.options?.label;
  }
};

const modelValue = ref();
watch(
  () => props.formSchemaElement,
  () => {
    modelValue.value = getElementName();
  },
  { deep: true, immediate: true }
);

// We always want to translate the label (untranslated labels are a thing of the past)
const onInput = (newValue: string) => {
  const localFormSchemaElement = cloneDeep(props.formSchemaElement);
  switch (localFormSchemaElement.type) {
    case 'Label':
      if (localFormSchemaElement.text) {
        break;
      }
      localFormSchemaElement.text = `#lang/text_${UUIDv4()}`;
      emit('update:form-schema-element', localFormSchemaElement);
      break;
    case 'Layout':
      if (localFormSchemaElement.options?.label) {
        break;
      }
      if (!localFormSchemaElement.options) {
        localFormSchemaElement.options = {};
      }
      localFormSchemaElement.options.label = `#lang/group_${UUIDv4()}`;
      emit('update:form-schema-element', localFormSchemaElement);
      break;
    default:
      break;
  }
  const key = (localFormSchemaElement.text || localFormSchemaElement.options?.label)?.replace('#lang/', '');
  if (!key) {
    throw new Error('TranslatedInput: No key found to use as translation key');
  }
  emit('set-translation', key, newValue);
};
</script>

<i18n src="~/locales/base/components/editor-form-schema-playground-edit-dialog-translated-input.json"></i18n>
