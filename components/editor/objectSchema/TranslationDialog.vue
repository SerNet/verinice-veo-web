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
    :title="t('editor.formschema.translation')"
    fixed-footer
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <div style="min-height: 20vh">
        <v-form v-model="formIsValid">
          <v-row no-gutters class="align-center mt-4">
            <v-col cols="12" :md="5">
              <span style="font-size: 1.2rem">{{ t('displayLanguageDescription') }}*:</span>
            </v-col>
            <v-col cols="12" :md="5">
              <v-select
                v-model="displayLanguage"
                :items="displayLanguageItems"
                :rules="requiredRule"
                :label="t('displayLanguage')"
                required
              />
            </v-col>
          </v-row>
          <v-row no-gutters class="align-center mt-4">
            <v-col cols="12" :md="5">
              <span style="font-size: 1.2rem">{{ t('supportedLanguages') }}*:</span>
            </v-col>
            <v-col cols="12" :md="5">
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
          <EditorObjectSchemaTranslationUpload
            v-model:replace-translations="replaceTranslations"
            :available-languages="supportedLanguages"
            @translations-imported="onTranslationsImported"
          />
          <v-row>
            <v-col v-for="language in supportedLanguages" :key="language" cols="12">
              <h3 class="text-h3">
                {{ languageDetails[language] }}
              </h3>
              <BaseCard>
                <UtilCodeEditor v-model="translations[language]" />
              </BaseCard>
            </v-col>
          </v-row>
        </v-form>
        <small>{{ t('global.input.requiredfields') }}</small>
      </div>
    </template>
    <template #dialog-options>
      <v-btn color="primary" @click="$emit('update:model-value', false)">
        {{ t('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn color="primary" :disabled="formIsValid === false" @click="onSave">
        {{ t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script lang="ts">
import { PropType, Ref } from 'vue';
import { merge } from 'lodash';
import type { LocaleObject } from '@nuxtjs/i18n';

import ObjectSchemaHelper from '~/lib/ObjectSchemaHelper2';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { IVeoTranslations } from '~/composables/api/queryDefinitions/translations';
import { IVeoTranslationCollection } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    availableLanguages: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    currentDisplayLanguage: {
      type: String,
      default: ''
    }
  },
  emits: ['update:current-display-language', 'update:model-value', 'schema-updated'],
  setup(props, { emit }) {
    const { locales, t } = useI18n();
    const { displayErrorMessage } = useVeoAlerts();

    const objectSchemaHelper = inject<Ref<ObjectSchemaHelper>>('objectSchemaHelper');

    // Local translations that get edited. Key is language, value is the language object. In this case a string as the editor returns a string and expects a string.
    const translations = reactive<{ [lang: string]: string }>(
      Object.entries(objectSchemaHelper?.value.getAllTranslations() || {}).reduce(
        (prevValue, [language, translations]) => {
          prevValue[language] = JSON.stringify(translations, undefined, 2);
          return prevValue;
        },
        {} as Record<string, any>
      )
    );

    // Form stuff
    const formIsValid = ref(true);
    const displayLanguage = ref<string>(props.currentDisplayLanguage);
    const supportedLanguages = ref<string[]>(objectSchemaHelper?.value.getLanguages() || []);

    const requiredRule = computed(() => [(v: any) => (Array.isArray(v) ? v.length > 0 : !!v)]);

    const languageDetails = computed(() =>
      (locales.value as LocaleObject[]).reduce(
        (previousValue, currentValue) => {
          previousValue[currentValue.code] = currentValue.name;
          return previousValue;
        },
        {} as Record<string, any>
      )
    );

    const supportedLanguageItems = computed(() =>
      props.availableLanguages.map((language: string) => ({
        title: languageDetails.value[language] || language,
        value: language
      }))
    );

    const displayLanguageItems = computed(() =>
      supportedLanguages.value.map((language: string) => ({
        title: languageDetails.value[language] || language,
        value: language
      }))
    );

    watch(
      () => supportedLanguages.value,
      (newValue) => {
        // Make sure all supported languages contain an entry in the translations object.
        newValue.forEach((language) => {
          if (!translations[language]) {
            const savedTranslations = objectSchemaHelper?.value.getTranslations(language);
            if (savedTranslations) {
              translations[language] = JSON.stringify(savedTranslations, undefined, 2);
            } else {
              translations[language] = JSON.stringify({});
            }
          }
        });

        // Remove all no longer supported languages from the translations object.
        Object.keys(translations).forEach((language) => {
          if (!newValue.includes(language)) {
            delete translations[language];
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
      }
    );

    watch(
      () => displayLanguage.value,
      (newValue) => {
        emit('update:current-display-language', newValue);
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

    // Translation file import stuff
    const replaceTranslations = ref(false);
    const onTranslationsImported = (_translations: IVeoTranslations['lang']) => {
      for (const language of Object.keys(translations)) {
        if (replaceTranslations.value) {
          translations[language] = JSON.stringify(_translations[language], undefined, 2);
        } else {
          translations[language] = JSON.stringify(
            merge(objectSchemaHelper?.value?.getTranslations(language) || {}, _translations[language]),
            undefined,
            2
          );
        }
      }
    };

    const onSave = () => {
      try {
        Object.entries(translations).forEach(([language, translations]) => {
          const parsedTranslation = JSON.parse(translations);
          const trimmedTranslations = trimTranslations(parsedTranslation);
          objectSchemaHelper?.value.updateTranslations(language, trimmedTranslations);
        });

        emit('update:model-value', false);
        emit('schema-updated');
      } catch (e: any) {
        displayErrorMessage(t('updateTranslationsError').toString(), e.message);
      }
    };

    // Helper
    function trimTranslations(obj: IVeoTranslations) {
      const trimmedObject = {} as IVeoTranslationCollection;
      for (const [key, value] of Object.entries(obj)) {
        trimmedObject[key] = value.trim();
      }
      return trimmedObject;
    }

    return {
      displayLanguage,
      displayLanguageItems,
      formIsValid,
      languageDetails,
      onSave,
      onTranslationsImported,
      replaceTranslations,
      requiredRule,
      supportedLanguages,
      supportedLanguageItems,
      translations,

      t
    };
  }
});
</script>

<i18n src="~/locales/base/components/editor-objectSchema-TranslationDialog.json"></i18n>
