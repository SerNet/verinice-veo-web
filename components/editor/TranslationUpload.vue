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
    <h3 class="text-h3 mt-6">
      {{ t('uploadLanguageFile') }}
    </h3>
    <BaseCard>
      <template #default>
        <v-card-text>
          <v-form
            v-model="formIsValid"
            @submit.prevent
          >
            <v-file-input
              v-model="languageFile"
              accept=".xlsx"
              counter
              dense
              :loading="uploadingLanguageFile"
              :prepend-icon="mdiTranslate"
              :rules="[requiredRule]"
              clearable
              :label="`${t('languageFile')}*`"
              show-size
              @update:model-value="uploadLanguageFile"
            />
            <v-row
              v-if="sheets.length > 1"
              class="mt-3"
            >
              <v-col
                cols="12"
                md="4"
              >
                <v-select
                  v-model="sheet"
                  :disabled="!languageFile || uploadingLanguageFile"
                  :items="sheets"
                  :label="`${t('sheet')}*`"
                />
              </v-col>
            </v-row>
            <v-row class="mt-3">
              <v-col
                cols="12"
                md="4"
              >
                <p class="text-body-2 mb-0">
                  {{ t('idColumn') }}
                </p>
                <v-select
                  v-model="idColumn"
                  :disabled="!languageFile || uploadingLanguageFile"
                  :items="availableColumns"
                  :rules="[requiredRule]"
                  :label="`${t('column')}*`"
                />
              </v-col>
              <v-col
                v-for="language of availableLanguages"
                :key="language"
              >
                <p
                  class="text-body-2 mb-0"
                >
                  {{ t('langColumn', [localeDetailsMap[language].name || language]) }}
                </p>
                <v-select
                  v-model="languageColumns[language]"
                  :disabled="!languageFile || uploadingLanguageFile"
                  :items="availableColumns"
                  :rules="[requiredRule]"
                  :label="`${t('column')}*`"
                />
              </v-col>
            </v-row>
            <div class="d-flex justify-space-between align-center">
              <v-checkbox
                :model-value="replaceTranslations"
                color="primary"
                :label="t('replaceTranslations')"
                @update:model-value="$emit('update:replace-translations', $event)"
              />
              <v-btn
                color="primary"
                flat
                :disabled="!formIsValid"
                role="submit"
                type="submit"
                @click="importFunction(columns, idColumn || 0, languageColumns)"
              >
                {{ t('import') }}
              </v-btn>
            </div>
          </v-form>
          <slot />
        </v-card-text>
      </template>
    </BaseCard>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';
import { mdiTranslate } from '@mdi/js';
import { read, WorkBook, WorkSheet } from 'xlsx';
import { trim } from 'lodash';

import { useVeoAlerts } from '~/composables/VeoAlert';

export default defineComponent({
  props: {
    availableLanguages: {
      type: Array as PropType<string[]>,
      required: true
    },
    importFunction: {
      type: Function as PropType<(columns: string[][], idColumn: number, languageColumns: { [lang: string]: number }) => void>,
      required: true
    },
    replaceTranslations: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:replace-translations'],
  setup() {
    const { locales, t } = useI18n();
    const { t: globalT } = useI18n();
    const { displayErrorMessage } = useVeoAlerts();

    // Layout / form stuff
    const localeDetailsMap = computed(() =>
      (locales.value as LocaleObject[]).reduce((previousValue, currentValue) => {
        previousValue[currentValue.code] = currentValue;
        return previousValue;
      }, Object.create(null))
    );

    const formIsValid = ref(false);
    const idColumn = ref<number>();
    const languageColumns = ref<{ [key: string]: number }>({});

    const requiredRule = (v: any) => (!!v && !!trim(v).length) || globalT('global.input.required').toString();

    // xlsx stuff
    const uploadingLanguageFile = ref(false);
    const languageFile = ref<File[]>();
    const workbook = ref<WorkBook>();

    const sheet = ref<string>();
    const sheets = computed(() => workbook.value?.SheetNames || []);

    const uploadLanguageFile = (newFile: File[] | undefined) => {
      // Reset selection
      uploadingLanguageFile.value = true;
      languageFile.value = newFile;
      sheet.value = undefined;

      if (!newFile) {
        uploadingLanguageFile.value = false;
        return;
      }

      const fileReader = new FileReader();

      // Register callback upon successfull file upload
      fileReader.onload = (event) => {
        const fileContent = event.target?.result;
        if (fileContent) {
          workbook.value = read(fileContent, {
            cellHTML: false,
            cellFormula: false
          });
          if (workbook.value.SheetNames.length === 1) {
            sheet.value = workbook.value.SheetNames[0];
          }
        }
        uploadingLanguageFile.value = false;
      };
      fileReader.onerror = () => {
        displayErrorMessage(t('fileUploadFailed').toString(), JSON.stringify(fileReader.error));
        uploadingLanguageFile.value = false;
      };

      // Read file
      fileReader.readAsArrayBuffer(newFile[0]);
    };

    watch(
      () => sheet.value,
      (newValue) => {
        if (newValue && workbook.value) {
          parseSheet(workbook.value.Sheets[newValue]);
        }
      }
    );

    // Parsed sheet stuff
    const columns = reactive<string[][]>([]);
    const availableColumns = ref<{ value: number; title: string }[]>();

    // Parse sheet to a two-dimensional array containing the values. It is a bit more complicated as we don't know how many columns exist in the beginning and the rows aren't necessarily in the right order
    const parseSheet = (sheet: WorkSheet) => {
      const toReturn: string[][] = [];
      for (const cell of Object.keys(sheet)) {
        // First char is usually either a meta field (starting with !) or defines the column (A,B,C,...)
        const firstChar = cell.charCodeAt(0);

        // If first char is a value between A and Z, continue
        if (firstChar >= 65 && firstChar <= 90) {
          const row = Number((cell || '').replace(/[^0-9]/g, '')) - 1; // Extract the number out of a key like A123. -1 as xlsx starts with row 1 instead of 0
          const arrayIndex = firstChar - 65; // A is index 0 in our array, B is 1...
          if (!toReturn[arrayIndex]) {
            toReturn[arrayIndex] = [];
          }
          toReturn[arrayIndex][row] = sheet[cell].w;
        }
      }
      Object.assign(columns, toReturn);
      availableColumns.value = columns
        .filter((column) => column[0])
        .map((column, index) => ({
          title: column[0].replace(/[^\w]/g, ''), // Remove special characters from column names
          value: index
        }))
        .filter((array) => array); // Filter out empty columns
    };

    return {
      availableColumns,
      columns,
      formIsValid,
      idColumn,
      languageColumns,
      languageFile,
      localeDetailsMap,
      requiredRule,
      sheet,
      sheets,
      uploadLanguageFile,
      uploadingLanguageFile,

      t,
      mdiTranslate
    };
  }
});
</script>

<i18n>
{
  "en": {
    "column": "Column",
    "fileUploadFailed": "Couldn't upload language file",
    "idColumn": "ID column",
    "import": "Import",
    "langColumn": "Column for language {0}",
    "languageFile": "Language file",
    "replaceTranslations": "Delete and replace existing translations",
    "sheet": "Sheet",
    "uploadLanguageFile": "Upload language file (.xlsx)"
  },
  "de": {
    "column": "Spalte",
    "fileUploadFailed": "Sprachdatei konnte nicht hochgeladen werden",
    "idColumn": "ID-Spalte",
    "import": "Importieren",
    "langColumn": "Spalte für Sprache {0}",
    "languageFile": "Sprachdatei",
    "replaceTranslations": "Vorhandene Übersetzungen löschen und ersetzen",
    "sheet": "Tabellenblatt",
    "uploadLanguageFile": "Sprachdatei hochladen (.xlsx)"
  }
}
</i18n>
