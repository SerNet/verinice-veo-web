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
  <BaseDialog
    :model-value="modelValue"
    large
    :headline="title"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <component
        :is="fittingEditComponent"
        v-model:form-schema-element="localFormSchemaElement"
      />
      <EditorFormSchemaPlaygroundEditDialogElementConditionalVisibility v-model:form-schema-element="localFormSchemaElement" />
    </template>
    <template #dialog-options>
      <v-btn
        variant="text"
        @click="emit('update:model-value', false)"
      >
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        :disabled="!elementIsDirty"
        @click="onSave"
      >
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

import EditorFormSchemaPlaygroundEditDialogControlElementSettings from './edit-dialog/ControlElementSettings.vue';
import EditorFormSchemaPlaygroundEditDialogLabelElementSettings from './edit-dialog/LabelElementSettings.vue';
import EditorFormSchemaPlaygroundEditDialogLayoutElementSettings from './edit-dialog/LayoutElementSettings.vue';
import { IVeoFormSchemaItem } from '~~/types/VeoTypes';
import { isEqual } from 'lodash';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  formSchemaElement: {
    type: Object as PropType<IVeoFormSchemaItem>,
    required: true
  }
});

const emit = defineEmits<{
  (event: 'update:model-value', value: boolean): void,
  (event: 'update:form-schema-element', formSchemaElement: IVeoFormSchemaItem): void
}>();

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

const translatedElementType = computed(() => t(`type.${props.formSchemaElement.type.toLowerCase()}`));

const title = computed(() => t('edit', [translatedElementType.value]));

const fittingEditComponent = computed(() => {
  switch(props.formSchemaElement.type) {
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

const elementIsDirty = computed(() => !isEqual(props.formSchemaElement, localFormSchemaElement.value));

const localFormSchemaElement = ref(props.formSchemaElement);
watch(() => props.formSchemaElement, (newValue) => {
  localFormSchemaElement.value = newValue;
}, { deep: true });

const onSave = () => {
  emit('update:form-schema-element', localFormSchemaElement.value);
  emit('update:model-value', false);
};
</script>

<i18n>
{
  "en": {
    "edit": "edit {0}",
    "type": {
      "control": "control",
      "label": "label",
      "layout": "layout",
      "widget": "widget"
    }
  },
  "de": {
    "edit": "{0} bearbeiten",
    "type": {
      "control": "Control",
      "label": "Label",
      "layout": "Layout",
      "widget": "Widget"
    }
  }
}
</i18n>
