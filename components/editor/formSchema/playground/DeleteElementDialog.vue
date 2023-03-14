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
    :headline="title"
    @update:model-value="emit('update:model-value')"
  >
    <template #default>
      <i18n-t
        keypath="deleteText"
        tag="span"
        scope="global"
      >
        <EditorTranslationsTranslatedElementTitle :form-schema-element="formSchemaElement" />
      </i18n-t>
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
        @click="onConfirm"
      >
        {{ globalT('global.button.delete') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

import { IVeoFormSchemaItem } from '~~/types/VeoTypes';

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

const emit = defineEmits(['update:model-value', 'delete']);

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

const translatedElementType = computed(() => t(`type.${props.formSchemaElement.type.toLowerCase()}`));

const title = computed(() => t('delete', [translatedElementType.value]));

const onConfirm = () => {
  emit('delete');
  emit('update:model-value', false);
};
</script>

<i18n>
{
  "en": {
    "delete": "delete {0}",
    "deleteText": "Do you really want to delete the element \"{0}\"? This action cannot be undone.",
    "type": {
      "control": "control",
      "label": "label",
      "layout": "layout",
      "widget": "widget"
    }
  },
  "de": {
    "delete": "{0} löschen",
    "deleteText": "Möchten Sie das Element \"{0}\" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    "type": {
      "control": "Control",
      "label": "Label",
      "layout": "Layout",
      "widget": "Widget"
    }
  }
}
</i18n>
