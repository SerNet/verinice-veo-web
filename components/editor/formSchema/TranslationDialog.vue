<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
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
    :confirm-close="dialogIsDirty"
    x-large
    :title="t('editTranslations')"
    fixed-footer
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <v-form v-model="formSchemaTitleFormIsValid">
        <h3 class="text-h3">
          {{ t('formSchemaTitle') }}
        </h3>
        <BaseCard>
          <v-card-text>
            <v-row>
              <v-col v-for="locale of locales" :key="locale" md="4" cols="12">
                <v-text-field
                  v-model="localFormSchemaTitles[locale]"
                  :label="t('title', [locale])"
                  :rules="[requiredRule]"
                  variant="underlined"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </BaseCard>
      </v-form>
      <div class="d-flex justify-space-between align-center mt-4">
        <h3 class="text-h3">
          {{ t('translations') }}
        </h3>
        <div>
          <v-switch v-model="expertMode" :label="t('expertMode')" color="primary" hide-details />
        </div>
      </div>
      <template v-if="!expertMode">
        <EditorTranslations
          v-if="!expertMode"
          v-model="localTranslations"
          :sources="formSchemaTranslationsOnly ? [TRANSLATION_SOURCE.FORMSCHEMA] : [TRANSLATION_SOURCE.UNSPECIFIED]"
          :modifieable-sources="[TRANSLATION_SOURCE.FORMSCHEMA]"
          @translation-deleted="
            deletedTranslations.push({
              key: $event.key,
              source: parseInt($event.source, 10)
            })
          "
        >
          <template #controls>
            <v-checkbox
              v-model="formSchemaTranslationsOnly"
              color="primary"
              hide-details
              :label="t('formSchemaTranslationsOnly')"
            />
          </template>
          <template #no-data="{ searchQuery }">
            <i18n-t
              v-if="formSchemaTranslationsOnly"
              keypath="formSchemaTranslations.formSchemaTranslationNotFoundSearchAll"
              scope="global"
            >
              <a class="cursor-pointer" @click.prevent="formSchemaTranslationsOnly = false">
                {{ t('click') }}
              </a>
            </i18n-t>
            <span v-else>{{ t('noTranslationsFound', [searchQuery]) }}</span>
          </template>
        </EditorTranslations>
      </template>
      <EditorTranslationsCodeEditor v-else v-model="localTranslations" :source="TRANSLATION_SOURCE.FORMSCHEMA" />
      <BaseCard class="mt-6">
        <v-expansion-panels>
          <v-expansion-panel>
            <template #title>
              <v-icon start>
                {{ mdiUpload }}
              </v-icon>
              <h3 class="text-h3">
                {{ t('import') }}
              </h3>
            </template>
            <template #text>
              <!-- formatting this block breaks the build -->
              <!-- prettier-ignore -->
              <EditorFormSchemaTranslationUpload
                v-model:replace-translations="replaceTranslationsWithUploadedTranslations"
                @translations-imported="onTranslationsImported"
              />
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
      </BaseCard>
    </template>
    <template #dialog-options>
      <v-btn variant="text" @click="emit('update:model-value', false)">
        {{ globalT('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn variant="text" color="primary" :disabled="!dialogIsDirty || !dialogIsValid" @click="onSave">
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script setup lang="ts">
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';
import { cloneDeep, isEqual } from 'lodash';

import { IEditorTranslations, TRANSLATION_SOURCE } from '../translations/types';
import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~/pages/[unit]/domains/[domain]/editor/formschema.vue';
import { mdiUpload } from '@mdi/js';
import { IVeoFormsTranslations } from '~/components/dynamic-form/types';
import { formsTranslationsToEditorTranslations } from '../translations/util';
import { IVeoFormSchema } from '~/composables/api/queryDefinitions/forms';
import { JsonPointer } from 'json-ptr';

const props = withDefaults(
  defineProps<{
    formSchemaTitles?: Record<string, string>;
    modelValue: boolean;
  }>(),
  {
    formSchemaTitles: () => ({})
  }
);

const emit = defineEmits<{
  (e: 'update:model-value', newValue: boolean): void;
  (e: 'update:form-schema-titles', titles: Record<string, string>): void;
}>();

const translations = inject<Ref<IEditorTranslations>>(FORMSCHEMA_PROVIDE_KEYS.TRANSLATIONS);
const formSchema = inject<Ref<IVeoFormSchema>>(FORMSCHEMA_PROVIDE_KEYS.FORMSCHEMA);

const deletedTranslations = ref<{ key: string; source: TRANSLATION_SOURCE }[]>([]);

const { locales: _locales, t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { requiredRule } = useRules();

const locales = computed(() => (_locales.value as LocaleObject[]).map((locale) => locale.code));

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      localFormSchemaTitles.value = cloneDeep(props.formSchemaTitles);
      localTranslations.value = cloneDeep(translations?.value);
    }
  }
);

const expertMode = ref(false);

// Code regarding changing the title of the formschema
const localFormSchemaTitles = ref<Record<string, string>>(props.formSchemaTitles);

const formSchemaTitleFormIsValid = ref(false);
const formSchemaTitleFormIsDirty = computed(() => !isEqual(props.formSchemaTitles, localFormSchemaTitles.value));
const saveNewFormSchemaTitles = () => {
  emit('update:form-schema-titles', cloneDeep(localFormSchemaTitles.value));
};

// Code regarding editing formschema translations
const formSchemaTranslationsOnly = ref(true);
const localTranslations = ref(cloneDeep(translations?.value));
const translationsModified = computed(() => !isEqual(translations?.value, localTranslations.value));

// Code regarding importing/exporting translations
const replaceTranslationsWithUploadedTranslations = ref(true);
const onTranslationsImported = (newTranslations: IVeoFormsTranslations) => {
  localTranslations.value = formsTranslationsToEditorTranslations(
    newTranslations,
    TRANSLATION_SOURCE.FORMSCHEMA,
    translations?.value,
    replaceTranslationsWithUploadedTranslations.value
  );
};

// Saving stuff
const dialogIsDirty = computed(() => formSchemaTitleFormIsDirty.value || translationsModified.value);
const dialogIsValid = computed(() => formSchemaTitleFormIsValid.value);
const onSave = () => {
  if (formSchemaTitleFormIsDirty.value) {
    saveNewFormSchemaTitles();
  }
  if (translationsModified.value && translations && localTranslations.value) {
    translations.value = cloneDeep(localTranslations.value);
  }

  // Remove all deleted translations from formschema if they are a formschema specific translation (starting with #lang/)
  const flattedFormSchemaKeyMap = Object.entries(JsonPointer.flatten(formSchema?.value));
  for (const deletedTranslation of deletedTranslations.value) {
    // Don't delete if either the deleted translations is not a formschema translations (shouldn't happen) or if there are still other translations for the key
    if (
      deletedTranslation.source !== TRANSLATION_SOURCE.FORMSCHEMA ||
      !!Object.keys(localTranslations.value?.[deletedTranslation.key] || {}).length
    ) {
      continue;
    }
    for (const [key, value] of flattedFormSchemaKeyMap) {
      if (value === `#lang/${deletedTranslation.key}`) {
        JsonPointer.unset(formSchema?.value, key);
        break;
      }
    }
  }
  deletedTranslations.value = [];
  emit('update:model-value', false);
};
</script>

<i18n>
{
  "en": {
    "click": "Click here",
    "editTranslations": "Edit formschema translations",
    "expertMode": "Expert mode",
    "formSchemaTitle": "Formschema title",
    "formSchemaTranslationNotFoundSearchAll": "No fitting formschema translation found. {0} to search all translations.",
    "formSchemaTranslationsOnly": "Only show form schema translations",
    "import": "Import",
    "noTranslationsFound": "No translations found for \"{0}\"",
    "title": "Formschema title ({0})",
    "translations": "Translations"
  },
  "de": {
    "click": "Klicken Sie hier",
    "editTranslations": "Formschema-Übersetzungen bearbeiten",
    "expertMode": "Expertenmodus",
    "formSchemaTitle": "Formschema-Titel",
    "formSchemaTranslationNotFoundSearchAll": "Keine passende Formschema-Übersetzung gefunden. {0}, um alle Übersetzungen zu durchsuchen.",
    "formSchemaTranslationsOnly": "Nur Formschema Übersetzungen anzeigen",
    "import": "Importieren",
    "noTranslationsFound": "Keine Übersetzungen für \"{0}\" gefunden",
    "title": "Formschema-Titel ({0})",
    "translations": "Übersetzungen"
  }
}
</i18n>
