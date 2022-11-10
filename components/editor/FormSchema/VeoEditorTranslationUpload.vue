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
    <VeoCard>
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
              @change="uploadLanguageFile"
            />
            <v-row
              v-if="sheets.length > 1"
              class="mt-3"
            >
              <v-col
                cols="12"
                md="4"
              >
                <p class="text-body-2 mb-0">
                  {{ t('sheet') }}
                </p>
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
                  :disabled="!languageFile || uploadingLanguageFile"
                  :items="availableColumns"
                  :rules="[requiredRule]"
                  :label="`${t('column')}*`"
                />
              </v-col>
            </v-row>
            <div class="text-right">
              <v-btn
                color="primary"
                depressed
                :disabled="!formIsValid"
                role="submit"
                type="submit"
                @click="importTranslations"
              >
                {{ t('import') }}
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </template>
    </VeoCard>
  </div>
</template>

<script lang="ts">
import { ref, useContext } from '@nuxtjs/composition-api';
import { LocaleObject } from '@nuxtjs/i18n/types';
import { computed, defineComponent, PropType, reactive, watch } from '@vue/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiTranslate } from '@mdi/js';
import { read, WorkBook, WorkSheet } from 'xlsx';
import { trim } from 'lodash';

import { useVeoAlerts } from '~/composables/VeoAlert';

export default defineComponent({
  props: {
    availableLanguages: {
      type: Array as PropType<string[]>,
      required: true
    }
  },
  setup() {
    const { i18n } = useContext();
    const { t } = useI18n();
    const { displayErrorMessage } = useVeoAlerts();

    // Layout / form stuff
    const localeDetailsMap = computed(() =>
      (i18n.locales as LocaleObject[]).reduce((previousValue, currentValue) => {
        previousValue[currentValue.code] = currentValue;
        return previousValue;
      }, Object.create(null))
    );

    const formIsValid = ref(false);
    const idColumn = ref<number>();
    const languageColumns = ref<{ [key: string]: number }>({});

    const requiredRule = (v: any) => (!!v && !!trim(v).length) || t('global.input.required').toString();

    // xlsx stuff
    const uploadingLanguageFile = ref(false);
    const languageFile = ref<File>();
    const workbook = ref<WorkBook>();

    const sheet = ref<string>();
    const sheets = computed(() => workbook.value?.SheetNames || []);

    const uploadLanguageFile = (newFile: File | undefined) => {
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
      fileReader.readAsArrayBuffer(newFile);
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
    const availableColumns = ref<{ value: number; text: string }[]>();

    const parseSheet = (sheet: WorkSheet) => {
      const toReturn: string[][] = [];
      for (const cell of Object.keys(sheet)) {
        const firstChar = cell.charCodeAt(0);

        if (firstChar >= 65 && firstChar <= 90) {
          const arrayIndex = firstChar - 65;
          if (!toReturn[arrayIndex]) {
            toReturn[arrayIndex] = [sheet[cell].w];
          } else {
            toReturn[arrayIndex].push(sheet[cell].w);
          }
        }
      }
      Object.assign(columns, toReturn);

      availableColumns.value = columns
        .map((column, index) => ({
          text: column[0].replace(/[^a-zA-Z0-9 ]/g, ''),
          value: index
        }))
        .filter((array) => array); // Filter out empty columns
    };

    const importTranslations = () => {};

    return {
      availableColumns,
      columns,
      formIsValid,
      idColumn,
      importTranslations,
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
    "idColumn": "ID-column",
    "import": "Import",
    "langColumn": "Column for language {0}",
    "languageFile": "Language file",
    "sheet": "Sheet",
    "uploadLanguageFile": "Upload language file"
  },
  "de": {
    "column": "Spalte",
    "fileUploadFailed": "Sprachdatei konnte nicht hochgeladen werden",
    "idColumn": "ID-Spalte",
    "import": "Importieren",
    "langColumn": "Spalte für Sprache {0}",
    "languageFile": "Sprachdatei",
    "sheet": "Tabelle",
    "uploadLanguageFile": "Sprachdatei hochladen"
  }
}
</i18n>
