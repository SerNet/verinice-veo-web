<!--
 * verinice.veo web
 * Copyright (C) 2025 Aziz Khalledi
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <ObjectCsvDialog
    v-if="isCsvDialogOpen"
    v-model="isCsvDialogOpen"
    :headers="headers"
    :data="parsedData"
    :preselected-type="objectType"
    :preselected-sub-type="subType"
    :required-fields="requiredFields"
    @navigate="handleNavigate"
    @close-csv-importer="emit('close')"
  />
  <BaseDialog
    v-else
    :close-function="closeDialog"
    relative-width="60%"
    title="CSV Import"
    fixed-footer
    flat
    inner-class="px-0 py-0"
  >
    <v-card class="bg-basepage csv-wizard-card">
      <template v-if="wizardStep === CsvUploadWizardStep.UPLOAD || wizardStep === CsvUploadWizardStep.CONFIRM_FILE">
        <v-card-title class="font-weight-bold px-6">
          <v-icon :icon="mdiHelpCircleOutline" />
          {{ t('export.sampleCsv') }}
        </v-card-title>

        <div class="d-flex align-center justify-space-between px-4">
          <v-card-subtitle class="flex-grow-1 text-wrap" style="max-width: 50%">
            {{ t('export.sampleCsvDescription') }}
          </v-card-subtitle>

          <ObjectCsvDownload :filter="filter" />
        </div>

        <v-file-upload
          :browse-text="t('import.button.browse')"
          :divider-text="t('import.or.text')"
          :icon="mdiUpload"
          :title="t('import.dropzone.label')"
          density="default"
          scrim="primary"
          accept=".csv"
          show-selection="false"
          :multiple="false"
          class="custom-file-upload drop-zone bg-surface"
          :class="{ 'drop-zone-active': isDragging }"
          :aria-label="t('import.dropzone.label')"
          data-component-name="csv-button"
          data-veo-test="csv-dialog-card"
          :disabled="!canManageUnitContent"
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @update:model-value="handleFileUpload"
          @click.prevent="triggerFileUpload"
        >
          <template #browse="{}">
            <template v-if="pendingFile">
              <div class="csv-selected-file__label">{{ t('import.selectedFile') }}</div>
              <v-chip color="primary" variant="outlined" class="csv-selected-file__chip">{{ pendingFile.name }}</v-chip>
              <v-btn color="primary" variant="flat" size="large">
                {{ t('import.button.changeFile') }}
              </v-btn>
            </template>
            <v-btn v-else color="primary" variant="flat" size="large">
              {{ t('import.button.browse') }}
            </v-btn>
            <span class="csv-upload-limit"> {{ t('import.uploadLimit.description') }}</span>
          </template>
          <template #item="{ props: itemProps }">
            <v-file-upload-item v-bind="itemProps" lines="one" nav />
          </template>
        </v-file-upload>
      </template>

      <div v-else class="encoding-step">
        <div class="encoding-step__title">{{ t('import.selectedEncoding') }}</div>
        <div class="encoding-step__content">
          <div>
            <div class="csv-selected-file__label">{{ t('import.selectedFile') }}</div>
            <v-chip color="primary" variant="outlined">{{ pendingFile?.name }}</v-chip>
          </div>
          <ObjectEncodingDialog v-model:encoding="selectedEncoding" inline class="encoding-select" />
        </div>
        <v-btn color="primary" variant="flat" class="encoding-step__change-file" @click="chooseAnotherFile">
          {{ t('import.button.changeFile') }}
        </v-btn>
      </div>

      <input ref="fileInputRef" type="file" accept=".csv" style="display: none" @change="handleNativeInputChange" />
    </v-card>
    <template #dialog-options>
      <v-btn variant="text" @click="emit('close')">
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="wizardStep === CsvUploadWizardStep.ENCODING"
        variant="text"
        @click="wizardStep = CsvUploadWizardStep.CONFIRM_FILE"
      >
        {{ t('global.button.back') }}
      </v-btn>
      <v-btn
        v-if="wizardStep === CsvUploadWizardStep.CONFIRM_FILE"
        color="primary"
        variant="flat"
        data-veo-test="confirm-csv-file-button"
        :disabled="!pendingFile || isProcessing"
        @click="continueToEncodingStep"
      >
        {{ t('global.button.next') }}
      </v-btn>
      <v-btn
        v-else-if="wizardStep === CsvUploadWizardStep.ENCODING"
        color="primary"
        variant="flat"
        data-veo-test="confirm-encoding-button"
        :disabled="!selectedEncoding || isProcessing"
        @click="handleEncodingConfirm"
      >
        {{ t('global.button.next') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { mdiUpload } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import ObjectCsvDialog from '~/components/object/CsvDialog.vue';
import { useCsvImporter } from '~/composables/csv/useCsvImporter';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { VFileUploadItem } from 'vuetify/labs/VFileUpload';
import { mdiHelpCircleOutline } from '@mdi/js';
import { VeoElementTypesSingular } from '~/types/VeoTypes';
import ObjectEncodingDialog from '~/components/object/EncodingDialog.vue';

const route = useRoute();
const { t } = useI18n();
const { parseCsv } = useCsvImporter();
const { displayErrorMessage } = useVeoAlerts();
const { setLoading, clearLoading } = useGlobalLoadingState();

const isProcessing = ref(false);

const { ability, subject } = useVeoPermissions();
const canManageUnitContent = computed(() => {
  return ability.value.can('manage', subject('units', { id: route.params.unit }));
});

interface Props {
  objectType?: string;
  subType?: string;
  requiredFields?: string[];
}

withDefaults(defineProps<Props>(), {
  objectType: '',
  subType: '',
  requiredFields: () => ['name']
});

const emit = defineEmits<{
  (event: 'navigate', objectType: string, subType: string): void;
  (event: 'close'): void;
}>();

const isCsvDialogOpen = ref(false);

enum CsvUploadWizardStep {
  UPLOAD = 'upload',
  CONFIRM_FILE = 'confirmFile',
  ENCODING = 'encoding'
}

const wizardStep = ref<CsvUploadWizardStep>(CsvUploadWizardStep.UPLOAD);
const headers = ref<string[]>([]);
const parsedData = ref<Record<string, any>[]>([]);
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const pendingFile = ref<File | null>(null);
const selectedEncoding = ref('UTF-8');

let loadingId: symbol | undefined;

interface ParsedCsvContent {
  headers: string[];
  records: Record<string, any>[];
}

const triggerFileUpload = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
    fileInputRef.value.click();
  }
};

const resetFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};
const isValidCsvFile = (file: File): boolean => {
  const type = file.type;
  const name = file.name.toLowerCase();
  return type === 'text/csv' || type === 'application/csv' || name.endsWith('.csv');
};

const isValidFileSize = (file: File): boolean => {
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  return file.size <= maxSize;
};

const isEmptyFile = (file: File): boolean => file.size === 0;

const extractFile = (input: any): File | null => {
  if (input instanceof File) return input;
  if (input instanceof FileList && input.length > 0) return input[0];
  if (Array.isArray(input) && input.length > 0) return input[0];
  return null;
};

const validateSelectedFile = (file: File | null) => {
  if (!file) {
    return;
  }

  if (!isValidCsvFile(file)) {
    displayErrorMessage(t('import.errors.invalidFile'), t('import.errors.onlyCsvAllowed'));
    return;
  }

  if (!isValidFileSize(file)) {
    displayErrorMessage(t('import.errors.fileTooLarge'), t('import.errors.maxFileSize'));
    return;
  }

  if (isEmptyFile(file)) {
    displayErrorMessage(t('import.errors.emptyFile'), t('import.errors.emptyFileMessage'));
    return;
  }

  return true;
};

const queueFileForEncoding = (file: File) => {
  pendingFile.value = file;
  wizardStep.value = CsvUploadWizardStep.CONFIRM_FILE;
};

const handleFileUpload = (files: any) => {
  const file = extractFile(files);
  if (!file) return;

  queueFileForEncoding(file);
};

const continueToEncodingStep = async () => {
  if (!validateSelectedFile(pendingFile.value)) {
    resetFileInput();
    return;
  }

  const hasValidCsvContent = await validateImportableCsvFile(pendingFile.value, selectedEncoding.value);
  if (!hasValidCsvContent) {
    return;
  }

  wizardStep.value = CsvUploadWizardStep.ENCODING;
};

const handleEncodingConfirm = async () => {
  if (!pendingFile.value) return;

  const processedFile = await processFile(pendingFile.value, selectedEncoding.value);

  pendingFile.value = null;

  if (processedFile) {
    isCsvDialogOpen.value = true;
  }
};

const handleNativeInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];

  queueFileForEncoding(file);
};

const chooseAnotherFile = () => {
  pendingFile.value = null;
  wizardStep.value = CsvUploadWizardStep.UPLOAD;
  triggerFileUpload();
};

const hasParsedCsvContent = (headersToCheck: string[], recordsToCheck: Record<string, any>[]) =>
  headersToCheck.length > 0 && recordsToCheck.length > 0;

const parseSelectedFile = async (file: File, encoding: string): Promise<ParsedCsvContent> => {
  const result = await parseCsv(file, {}, encoding);
  return {
    headers: result.value.headers,
    records: result.value.records
  };
};

const hasImportableCsvContent = ({ headers, records }: ParsedCsvContent) => hasParsedCsvContent(headers, records);

const storeParsedCsvContent = ({ headers: parsedHeaders, records }: ParsedCsvContent) => {
  headers.value = parsedHeaders;
  parsedData.value = records;
};

const runWithProcessingState = async <T,>(action: () => Promise<T>) => {
  if (isProcessing.value) return null;

  isProcessing.value = true;
  try {
    loadingId = setLoading(t('import.loading.processing'));
    return await action();
  } catch (error) {
    console.error('Error processing CSV file:', error);
    displayErrorMessage(t('import.errors.processingFailed'), String(error));
    resetFileInput();
    return null;
  } finally {
    clearLoading(loadingId);
    loadingId = undefined;
    isProcessing.value = false;
  }
};

const processFile = async (file: File, encoding: string) => {
  if (!file) return null;

  const parsedCsv = await runWithProcessingState(() => parseSelectedFile(file, encoding));
  if (!parsedCsv) {
    return null;
  }

  if (!hasImportableCsvContent(parsedCsv)) {
    displayErrorMessage(t('import.errors.emptyFile'), t('import.errors.emptyFileMessage'));
    resetFileInput();
    return null;
  }

  storeParsedCsvContent(parsedCsv);
  resetFileInput();
  return parsedCsv;
};

const validateImportableCsvFile = async (file: File | null, encoding: string) => {
  if (!file) return false;

  const parsedCsv = await runWithProcessingState(() => parseSelectedFile(file, encoding));
  if (!parsedCsv) return false;

  if (!hasImportableCsvContent(parsedCsv)) {
    displayErrorMessage(t('import.errors.emptyFile'), t('import.errors.emptyFileMessage'));
    resetFileInput();
    return false;
  }

  return true;
};

const handleNavigate = (objectType: string, subType: string) => {
  emit('navigate', objectType, subType);
};

function closeDialog() {
  emit('close');
  return true;
}

enum FILTER_SOURCE {
  QUERY,
  PARAMS,
  NONE
}

type IFilterDefinition = {
  [filterKey: string]: {
    source: FILTER_SOURCE;
    nullValue?: any;
  };
};
const filterDefinitions: IFilterDefinition = {
  objectType: {
    source: FILTER_SOURCE.PARAMS
  },
  subType: {
    source: FILTER_SOURCE.PARAMS,
    nullValue: '-'
  }
};
const filter = computed(() =>
  Object.fromEntries(
    Object.entries(filterDefinitions).map(([key, def]) => {
      const raw = def.source === FILTER_SOURCE.QUERY ? route.query[key] : route.params[key];

      const value = Array.isArray(raw) ? raw[0] : raw;

      return [
        key,
        value === def.nullValue ? undefined
        : value === 'true' ? true
        : key === 'objectType' ? VeoElementTypesSingular[value as string]
        : value
      ];
    })
  )
);
</script>

<i18n src="~/locales/base/components/object-csv-import-card.json"></i18n>

<style scoped>
::v-deep(.v-divider__content) {
  color: #555555 !important;
}

.custom-file-upload {
  padding: 0;
}

.csv-wizard-card {
  min-height: 420px;
}

.encoding-step {
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.encoding-step__title {
  margin-bottom: 24px;
  font-size: 1.25rem;
  line-height: 2rem;
  font-weight: 500;
}

.encoding-step__content {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: center;
  justify-content: center;
}

.encoding-step__change-file {
  margin-top: 24px;
}

.encoding-select {
  width: 220px;
}

.csv-selected-file__label,
.csv-upload-limit {
  font-size: 0.75rem;
  line-height: 1.25rem;
  opacity: 0.65;
}

.csv-selected-file__label {
  margin-bottom: 8px;
}

.csv-selected-file__chip {
  margin-bottom: 16px;
}

.csv-upload-limit {
  margin-top: 16px;
}
</style>
