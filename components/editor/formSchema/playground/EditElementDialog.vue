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
  <BaseDialog :model-value="modelValue" large :title="title" @update:model-value="emit('update:model-value', $event)">
    <template #default>
      <component
        :is="fittingEditComponent"
        v-model:form-schema-element="localFormSchemaElement"
        :pointer="pointer"
        :playground-element="playgroundElement"
        @add="(elementPointer: string, element: IVeoFormSchemaItem) => emit('add', elementPointer, element)"
        @remove="(elementPointer: string) => emit('remove', elementPointer)"
        @set-translation="setPendingTranslation"
      >
        <slot />
      </component>
      <EditorFormSchemaPlaygroundEditDialogElementConditionalVisibility
        v-model:form-schema-element="localFormSchemaElement"
      />
    </template>
    <template #dialog-options>
      <v-btn variant="text" @click="emit('update:model-value', false)">
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn variant="text" color="primary" :disabled="!elementIsDirty" @click="onSave">
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
export type PENDING_TRANSLATIONS = Record<string, Record<string, string | undefined>>;
</script>

<script setup lang="ts">
import { cloneDeep, isEqual } from 'lodash';

import EditorFormSchemaPlaygroundEditDialogControlElementSettings from './edit-dialog/ControlElementSettings.vue';
import EditorFormSchemaPlaygroundEditDialogLabelElementSettings from './edit-dialog/LabelElementSettings.vue';
import EditorFormSchemaPlaygroundEditDialogLayoutElementSettings from './edit-dialog/LayoutElementSettings.vue';
import type { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~/pages/[unit]/domains/[domain]/editor/formschema.vue';
import type { IPlaygroundElement } from './Element.vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    formSchemaElement: IVeoFormSchemaItem;
    pointer: string;
    playgroundElement: IPlaygroundElement;
  }>(),
  {
    modelValue: false
  }
);

const emit = defineEmits<{
  (event: 'update:model-value', value: boolean): void;
  (event: 'update:form-schema-element', formSchemaElement: IVeoFormSchemaItem): void;
  (event: 'set-translations', translations: PENDING_TRANSLATIONS): void;
  (event: 'add', pointer: string, element: IVeoFormSchemaItem): void;
  (event: 'remove', pointer: string, removeFromSchemaElementMap?: boolean): void;
}>();

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

const language = inject<Ref<string>>(FORMSCHEMA_PROVIDE_KEYS.EDITOR_LANGUAGE);

const translatedElementType = computed(() => t(`type.${props.formSchemaElement.type.toLowerCase()}`));

const title = computed(() => t('edit', [translatedElementType.value]));

const fittingEditComponent = computed(() => {
  switch (props.formSchemaElement.type) {
    case 'Control':
      return EditorFormSchemaPlaygroundEditDialogControlElementSettings;
    case 'Label':
      return EditorFormSchemaPlaygroundEditDialogLabelElementSettings;
    case 'Layout':
      return EditorFormSchemaPlaygroundEditDialogLayoutElementSettings;
    default:
      return h('div', 'Cannot find edit options for this form schema element type');
  }
});

const elementIsDirty = computed(
  () => !isEqual(props.formSchemaElement, localFormSchemaElement.value) || Object.keys(pendingTranslations.value).length
);

const localFormSchemaElement = ref(props.formSchemaElement);
// Reset local element if user reopens dialog
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      localFormSchemaElement.value = cloneDeep(props.formSchemaElement);
    }
  }
);
watch(
  () => props.formSchemaElement,
  (newValue) => {
    localFormSchemaElement.value = cloneDeep(newValue);
  },
  { deep: true }
);

// Translations shouldn't be edited immediately, so we write changes to this component and the formschema page handles the rest
const pendingTranslations = ref<PENDING_TRANSLATIONS>({});

const setPendingTranslation = (translationKey: string, value: string | undefined) => {
  if (language?.value) {
    if (!pendingTranslations.value[language.value]) {
      pendingTranslations.value[language.value] = {};
    }
    pendingTranslations.value[language.value][translationKey] = value;
  }
};

const onSave = () => {
  emit('set-translations', pendingTranslations.value);
  emit('update:form-schema-element', localFormSchemaElement.value);
  emit('update:model-value', false);
};
</script>

<i18n src="~/locales/base/components/editor-form-schema-playground-edit-element-dialog.json"></i18n>
