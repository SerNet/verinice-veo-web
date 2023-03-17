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
    v-bind="$attrs"
    large
    :headline="t('editor.formschema.translation')"
    fixed-footer
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <div style="min-height: 20vh">
        <v-form v-model="formIsValid">
          <v-row
            no-gutters
            class="align-center mt-4"
          >
            <v-col
              cols="12"
              md="5"
            >
              <span
                style="font-size: 1.2rem;"
              >{{ t('displayLanguageDescription') }}*:</span>
            </v-col>
            <v-col
              cols="12"
              md="5"
            >
              <v-select
                v-model="displayLanguage"
                :items="displayLanguageItems"
                :rules="requiredRule"
                :label="t('displayLanguage')"
                required
              />
            </v-col>
          </v-row>
          <v-row
            no-gutters
            class="align-center mt-4"
          >
            <v-col
              cols="12"
              md="5"
            >
              <span
                style="font-size: 1.2rem;"
              >{{ t('supportedLanguages') }}*:</span>
            </v-col>
            <v-col
              cols="12"
              md="5"
            >
              <v-select
                v-model="supportedLanguages"
                :items="supportedLanguageItems"
                :rules="requiredRule"
                multiple
                :label="t('supportedLanguages')"
                required
              />
            </v-col>
          </v-row>
          <EditorFormSchemaTranslationUpload
            v-model:replace-translations="replaceTranslations"
            :available-languages="availableLanguages"
            @translations-imported="onTranslationsImported"
          />
          <v-row>
            <v-col
              v-for="(_, language) in localTranslations"
              :key="language"
              cols="12"
            >
              <h3 class="text-h3 mt-6">
                {{ languageDetails[language] }}
              </h3>
              <BaseCard>
                <v-card-text>
                  <v-row no-gutters>
                    <v-col
                      cols="12"
                      md="5"
                    >
                      <v-text-field
                        v-model="formSchemaTitles[language]"
                        flat
                        :label="t('schemaName')"
                      />
                    </v-col>
                  </v-row>

                  <UtilCodeEditor v-model="localTranslations[language]" />
                </v-card-text>
              </BaseCard>
            </v-col>
          </v-row>
        </v-form>
        <small>{{ t('global.input.requiredfields') }}</small>
      </div>
    </template>
    <template #dialog-options>
      <v-btn
        text
        @click="$emit('update:model-value', false)"
      >
        {{ t('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!formIsValid"
        @click="onSave"
      >
        {{ t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script lang="ts">
import { PropType } from 'vue';
import { difference, merge } from 'lodash';
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';

import { IVeoFormSchemaTranslationCollection } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { IVeoFormSchemaMeta } from '~~/composables/api/queryDefinitions/forms';
import { IVeoTranslations } from '~~/composables/api/queryDefinitions/translations';

export default defineComponent({
  props: {
    availableLanguages: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    currentDisplayLanguage: {
      type: String,
      default: ''
    },
    name: {
      type: Object as PropType<IVeoFormSchemaMeta['name']>,
      required: true
    },
    translations: {
      type: Object as PropType<IVeoFormSchemaTranslationCollection>,
      required: true
    }
  },
  emits: ['update:model-value', 'update:current-display-language', 'update-translation', 'update-name'],
  setup(props, { emit }) {
    const { locales, t } = useI18n();
    const { displayErrorMessage } = useVeoAlerts();

    const EMPTY_OBJECT_STRING = '{\n  \n}';
    const localTranslations = reactive<{ [lang: string]: string }>(
      Object.entries(props.translations).reduce((prevValue, [language, translations]) => {
        prevValue[language] = JSON.stringify(translations, undefined, 2);
        return prevValue;
      }, {} as Record<string, any>)
    );
    const formSchemaTitles = reactive<IVeoFormSchemaMeta['name']>(props.name);

    // Form stuff
    const formIsValid = ref(true);
    const displayLanguage = ref<string>(props.currentDisplayLanguage);
    const supportedLanguages = ref<string[]>(Object.keys(props.translations));

    const requiredRule = computed(() => [(v: any) => (Array.isArray(v) ? v.length > 0 : !!v)]);

    const languageDetails = computed(() =>
      (locales.value as LocaleObject[]).reduce((previousValue, currentValue) => {
        previousValue[currentValue.code] = currentValue.name;
        return previousValue;
      }, {} as Record<string, any>)
    );

    const supportedLanguageItems = computed(() =>
      props.availableLanguages.map((languageCode) => ({ title: languageDetails.value[languageCode] || languageCode, value: languageCode }))
    );

    const displayLanguageItems = computed(() =>
      supportedLanguages.value.map((languageCode) => ({ title: languageDetails.value[languageCode] || languageCode, value: languageCode }))
    );

    watch(
      () => supportedLanguages.value,
      (newValue, oldValue) => {
        const removedLanguageCodes = difference(oldValue, newValue);

        newValue.forEach((languageCode) => {
          if (!localTranslations[languageCode]) {
            localTranslations[languageCode] = EMPTY_OBJECT_STRING;
          }
        });
        // If the display language is removed, fallback to another eligible language
        if (!newValue.includes(displayLanguage.value)) {
          if (newValue.length > 0) {
            displayLanguage.value = newValue[0];
          } else {
            displayLanguage.value = '';
          }
        }
        // If a language code has been removed, removed it from formschema name
        removedLanguageCodes.forEach((removedLanguageCode) => {
          delete formSchemaTitles[removedLanguageCode];
        });
      }
    );

    watch(
      () => displayLanguage.value,
      (newValue) => {
        if (newValue) {
          emit('update:current-display-language', newValue);
        }
      }
    );

    watch(
      () => props.currentDisplayLanguage,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          displayLanguage.value = newValue;
        }
      }
    );

    watch(
      () => props.name,
      (newValue) => {
        Object.assign(formSchemaTitles, newValue);
      }
    );

    watch(
      () => props.translations,
      (newValue) => {
        Object.assign(
          localTranslations,
          Object.entries(newValue).reduce((prevValue, [language, translations]) => {
            prevValue[language] = JSON.stringify(translations, undefined, 2);
            return prevValue;
          }, {} as Record<string, any>)
        );
      }
    );

    // Translation upload stuff
    const replaceTranslations = ref(false);

    const onTranslationsImported = (translations: IVeoTranslations['lang']) => {
      for (const language of Object.keys(translations)) {
        if (replaceTranslations.value) {
          localTranslations[language] = JSON.stringify(translations[language], undefined, 2);
        } else {
          localTranslations[language] = JSON.stringify(merge(props.translations[language], translations[language]), undefined, 2);
        }
      }
    };

    const onSave = () => {
      try {
        const translationsAsJSON = Object.fromEntries(
          Object.entries(localTranslations).map(([language, translations]) => {
            const parsedTranslation = JSON.parse(translations);
            return [language, parsedTranslation];
          })
        );

        emit('update:model-value', false);
        emit('update-translation', translationsAsJSON);
        emit('update-name', formSchemaTitles);
      } catch (e: any) {
        displayErrorMessage(t('updateTranslationsError').toString(), e.message);
      }
    };

    return {
      displayLanguage,
      displayLanguageItems,
      formIsValid,
      formSchemaTitles,
      languageDetails,
      localTranslations,
      onSave,
      onTranslationsImported,
      replaceTranslations,
      requiredRule,
      supportedLanguages,
      supportedLanguageItems,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "displayLanguage": "Languages",
    "displayLanguageDescription": "Display language in form schema editor",
    "supportedLanguages": "Supported Languages",
    "schemaName": "Name of the form schema",
    "updateTranslationsError": "Couldn't update translations"
  },
  "de": {
    "displayLanguage": "Sprache",
    "displayLanguageDescription": "Anzeigesprache im Formschema Editor",
    "supportedLanguages": "Sprachen",
    "schemaName": "Name des Formschemas",
    "updateTranslationsError": "Übersetzungen konnten nicht aktualisiert werden"
  }
}
</i18n>
