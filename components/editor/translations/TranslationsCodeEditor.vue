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
  <BaseAlert
    v-if="validationError"
    :model-value="true"
    :type="VeoAlertType.ERROR"
    no-close-button
    class="mb-2"
    :title="t('pleaseFixError')"
  >
    {{ validationError }}
  </BaseAlert>
  <BaseCard>
    <v-card-text>
      <UtilCodeEditor
        :model-value="editorContent"
        @update:model-value="onTranslationsUpdated"
      />
    </v-card-text>
  </BaseCard>
</template>

<script setup lang="ts">
import { VeoAlertType } from '~/types/VeoTypes';
import { IEditorTranslations, TRANSLATION_SOURCE } from './types';
import { editorTranslationsToFormsTranslations, formsTranslationsToEditorTranslations } from './util';
import { IVeoFormsTranslations } from '~/components/dynamic-form/types';

const props = withDefaults(defineProps<{
  modelValue?: IEditorTranslations;
  source: TRANSLATION_SOURCE;
}>(), {
  modelValue: () => ({})
});

const emit = defineEmits<{
  (e: 'update:modelValue', newValue: IEditorTranslations): void,
}>();

const { t } = useI18n();

const editorContent = computed(() => JSON.stringify(editorTranslationsToFormsTranslations(props.modelValue, [TRANSLATION_SOURCE.FORMSCHEMA]), undefined, 2));

const validationError = ref<string | undefined>(undefined);
const onTranslationsUpdated = (newTranslations: string) => {
  try {
    const parsedTranslations: IVeoFormsTranslations = JSON.parse(newTranslations);
    validationError.value = undefined;
    
    emit('update:modelValue', formsTranslationsToEditorTranslations(parsedTranslations, TRANSLATION_SOURCE.FORMSCHEMA, props.modelValue));
  } catch (error: any) {
    validationError.value = error.message;
  }
};
</script>

<i18n>
{
  "en": {
    "pleaseFixError": "Please fix the following error to save the translations:"
  },
  "de": {
    "pleaseFixError": "Bitte beheben Sie den folgenden Fehler, um die Übersetzungen zu speichern:"
  }
}
</i18n>
