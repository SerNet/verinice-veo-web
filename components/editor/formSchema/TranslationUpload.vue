<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <EditorTranslationUpload
    :available-languages="availableLanguages"
    :import-function="importFunction"
    :replace-translations="replaceTranslations"
    @update:replace-translations="$emit('update:replace-translations', $event)"
  >
    <template #default>
      <v-expansion-panels
        v-model="resultExpansionPanel"
        flat
        class="veo-border mt-6"
      >
        <v-expansion-panel>
          <template #title>
            {{ t('result') }}
          </template>
          <template #text>
            <BaseAlert
              :model-value="!!usedTranslations.length"
              :title="t('importedTranslations')"
              flat
              no-close-button
              :type="VeoAlertType.SUCCESS"
            >
              <template #default>
                <div
                  v-for="language of Object.entries(usedTranslations)"
                  :key="language[0]"
                  class="mt-2"
                >
                  {{ localeDetailsMap[language[0]].name }}
                  <ul>
                    <li
                      v-for="translation of language[1]"
                      :key="translation"
                    >
                      {{ translation }}
                    </li>
                  </ul>
                </div>
              </template>
            </BaseAlert>
            <BaseAlert
              :model-value="!!duplicateTranslations.length"
              :title="t('duplicateTranslations')"
              flat
              no-close-button
              :type="VeoAlertType.INFO"
            >
              <template #default>
                <div
                  v-for="language of Object.entries(duplicateTranslations)"
                  :key="language[0]"
                  class="mt-2"
                >
                  {{ localeDetailsMap[language[0]].name }}
                  <ul>
                    <li
                      v-for="translation of language[1]"
                      :key="translation"
                    >
                      {{ translation }}
                    </li>
                  </ul>
                </div>
              </template>
            </BaseAlert>
            <BaseAlert
              :model-value="!!unusedTranslations.length"
              :title="t('unusedTranslations')"
              flat
              no-close-button
              :type="VeoAlertType.INFO"
            >
              <template #default>
                <ul>
                  <li
                    v-for="translation of unusedTranslations"
                    :key="translation"
                  >
                    {{ translation }}
                  </li>
                </ul>
              </template>
            </BaseAlert>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
  </EditorTranslationUpload>
</template>

<script lang="ts">
import { Ref } from 'vue';
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';
import { JsonPointer } from 'json-ptr';
import { trim } from 'lodash';

import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { VeoAlertType } from '~/types/VeoTypes';
import { IVeoFormSchema } from '~~/composables/api/queryDefinitions/forms';
import { useQuery } from '~~/composables/api/utils/query';

export default defineComponent({
  props: {
    replaceTranslations: {
      type: Boolean,
      default: false
    }
  },
  emits: ['translations-imported', 'update:replace-translations'],
  setup(props, { emit }) {
    const { locales, t } = useI18n();

    const formSchema = inject<Ref<IVeoFormSchema | undefined>>('mainFormSchema');

    const availableLanguages = computed(() => (locales.value as LocaleObject[]).map((locale) => locale.code));

    const translationsQueryParameters = computed(() => ({ languages: availableLanguages.value }));
    const { data: objectSchemaTranslations } = useQuery(translationQueryDefinitions.queries.fetch, translationsQueryParameters);

    // Layout stuff
    const resultExpansionPanel = ref();

    const localeDetailsMap = computed(() =>
      (locales.value as LocaleObject[]).reduce((previousValue, currentValue) => {
        previousValue[currentValue.code] = currentValue;
        return previousValue;
      }, Object.create(null))
    );

    // Import stuff
    const unusedTranslations = ref<string[]>([]);
    const duplicateTranslations = reactive<{ [lang: string]: string[] }>({});
    const usedTranslations = reactive<{ [lang: string]: string[] }>({});

    const importFunction = (columns: string[][], idColumn: number, languageColumns: { [language: string]: number }) => {
      if (idColumn === undefined || Object.keys(languageColumns).length < availableLanguages.value.length) {
        return;
      }
      unusedTranslations.value = [];
      const translations = availableLanguages.value.reduce((previousValue, currentValue) => {
        previousValue[currentValue] = {};
        return previousValue;
      }, Object.create(null));

      const usedLanguageKeys = Object.entries(JsonPointer.flatten(formSchema?.value))
        .filter(([key, _value]) => key.endsWith('/label'))
        .map(([_, value]) => (value as string).split('#lang/')[1]);
      unusedTranslations.value = [];
      Object.assign(
        duplicateTranslations,
        availableLanguages.value.reduce((previousValue, currentValue) => {
          previousValue[currentValue] = [];
          return previousValue;
        }, Object.create(null))
      );

      for (let i = 0; i < columns[idColumn].length; i++) {
        const id = trim(columns[idColumn][i]);

        // If empty cell, go to next cell
        if (!id) {
          continue;
        }

        // If id is not used in this form schema, add to unusedTranslations array and go to next id
        if (!usedLanguageKeys.includes(id) && !unusedTranslations.value.includes(id)) {
          unusedTranslations.value.push(id);
          continue;
        }

        for (const language of Object.entries(languageColumns)) {
          const translatedValue = trim(columns[language[1]][i]);

          if (translatedValue) {
            if (objectSchemaTranslations.value?.lang?.[language[0]]?.[id] === translatedValue && !duplicateTranslations[language[0]].includes(id)) {
              duplicateTranslations[language[0]].push(id);
              continue;
            }

            translations[language[0]][id] = translatedValue;
          }
        }
      }
      Object.assign(
        usedTranslations,
        Object.entries(translations).reduce((previousValue, [language, entries]) => {
          previousValue[language] = Object.keys(entries as any);

          return previousValue;
        }, Object.create(null))
      );

      resultExpansionPanel.value = 0;
      emit('translations-imported', translations);
    };

    return {
      availableLanguages,
      duplicateTranslations,
      importFunction,
      localeDetailsMap,
      resultExpansionPanel,
      unusedTranslations,
      usedTranslations,

      VeoAlertType,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "duplicateTranslations": "Translations already present in the object schema (not imported)",
    "importedTranslations": "Imported translations",
    "result": "Upload details",
    "unusedTranslations": "Translations of controls not present in form schema (not imported)",
  },
  "de": {
    "duplicateTranslations": "Bereits im Objektschema vorhandene Übersetzungen (nicht importiert)",
    "importedTranslations": "Importierte Übersetzungen",
    "result": "Upload-Details",
    "unusedTranslations": "Übersetzungen von nicht im Formschema vorhandenen Controls (nicht importiert)",
  }
}
</i18n>
