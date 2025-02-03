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
  <div>
    <BaseAlert :model-value="true" flat no-close-button :type="VeoAlertType.INFO">
      {{ t('uploadOverwrite') }}
    </BaseAlert>
    <EditorTranslationUpload
      :available-languages="availableLanguages"
      :import-function="importFunction"
      :replace-translations="replaceTranslations"
      @update:replace-translations="$emit('update:replace-translations', $event)"
    >
      <template #default>
        <v-expansion-panels v-model="resultExpansionPanel" flat class="veo-border mt-6">
          <v-expansion-panel>
            <v-expansion-panel-title>
              {{ t('result') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <BaseAlert
                :model-value="!!usedTranslations.length"
                :title="t('importedTranslations')"
                flat
                no-close-button
                :type="VeoAlertType.SUCCESS"
              >
                <template #default>
                  <div v-for="language of Object.entries(usedTranslations)" :key="language[0]" class="mt-2">
                    {{ localeDetailsMap[language[0]].name }}
                    <ul>
                      <li v-for="translation of language[1]" :key="translation">
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
                    <li v-for="translation of unusedTranslations" :key="translation">
                      {{ translation }}
                    </li>
                  </ul>
                </template>
              </BaseAlert>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
    </EditorTranslationUpload>
  </div>
</template>

<script lang="ts">
import { trim } from 'lodash';
import { PropType, Ref } from 'vue';
import type { LocaleObject } from '@nuxtjs/i18n';

import ObjectSchemaHelper, { IVeoOSHCustomAspect, IVeoOSHCustomLink } from '~/lib/ObjectSchemaHelper2';

import { VeoAlertType } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    availableLanguages: {
      type: Array as PropType<string[]>,
      required: true
    },
    replaceTranslations: {
      type: Boolean,
      default: false
    }
  },
  emits: ['translations-imported', 'update:replace-translations'],
  setup(props, { emit }) {
    const { locales, t } = useI18n();

    const objectSchemaHelper = inject<Ref<ObjectSchemaHelper>>('objectSchemaHelper');

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
    const usedTranslations = reactive<{ [lang: string]: string[] }>({});

    const importFunction = (columns: string[][], idColumn: number, languageColumns: { [language: string]: number }) => {
      if (!idColumn || Object.keys(languageColumns).length < props.availableLanguages.length) {
        return;
      }
      unusedTranslations.value = [];
      const translations = props.availableLanguages.reduce((previousValue, currentValue) => {
        previousValue[currentValue] = {};
        return previousValue;
      }, Object.create(null));

      const extractAttributeTitles = (properties: (IVeoOSHCustomAspect | IVeoOSHCustomLink)[]) =>
        properties.reduce((previousValue, currentValue) => {
          previousValue.push(currentValue.title);
          for (const child of currentValue.attributes) {
            previousValue.push(`${currentValue.title}_${child.title}`);
          }
          return previousValue;
        }, [] as any[]);

      const prefix = objectSchemaHelper?.value?.getTitle();
      const usedLanguageKeys: string[] = [
        ...extractAttributeTitles(objectSchemaHelper?.value?.getCustomAspects() || []).map(
          (property) => `${prefix}_${property}`
        ),
        ...extractAttributeTitles(objectSchemaHelper?.value?.getCustomLinks() || []).map(
          (property) => `${prefix}_${property}`
        ),
        ...(objectSchemaHelper?.value?.getBasicProperties() || []).map((property) => property.title)
      ];
      unusedTranslations.value = [];

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

<i18n src="~/locales/base/components/editor-object-schema-translation-upload.json"></i18n>
