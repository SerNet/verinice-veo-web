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
  <div>
    <div class="import-container">
      <v-card class="upload-card" flat>
        <v-card-title class="text-center font-weight-bold mb-6">{{ t('import.title') }}</v-card-title>
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
          class="custom-file-upload drop-zone"
          :class="{ 'drop-zone-active': isDragging }"
          :aria-label="t('import.dropzone.label')"
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @update:model-value="handleFileUpload"
          @click.prevent="triggerFileUpload"
        >
          <template #browse="{}">
            <v-btn color="primary" class="browse-button" size="large" flat>
              {{ t('import.button.browse') }}
            </v-btn>
          </template>
          <template #item="{ props: itemProps }">
            <v-file-upload-item v-bind="itemProps" lines="one" nav> </v-file-upload-item>
          </template>
        </v-file-upload>

        <input ref="fileInputRef" type="file" accept=".csv" style="display: none" @change="handleNativeInputChange" />
      </v-card>
    </div>

    <ObjectCsvDialog
      v-if="isCsvDialogOpen"
      v-model="isCsvDialogOpen"
      :headers="headers"
      :data="parsedData"
      :preselected-type="objectType"
      :preselected-sub-type="subType"
      :required-fields="requiredFields"
      @navigate="handleNavigate"
    />
  </div>
</template>

<script setup lang="ts">
import { mdiUpload } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import ObjectCsvDialog from '~/components/object/CsvDialog.vue';
import { useCsvImporter } from '~/composables/csv/useCsvImporter';
import { useVeoAlerts } from '~/composables/VeoAlert';

const { t } = useI18n();
const { parseCsv } = useCsvImporter();
const { displayErrorMessage } = useVeoAlerts();

const isProcessing = ref(false);

const props = defineProps({
  objectType: {
    type: String,
    default: ''
  },
  subType: {
    type: String,
    default: ''
  },
  requiredFields: {
    type: Array as () => string[],
    default: () => ['name']
  }
});
const emit = defineEmits<{
  (event: 'navigate', objectType: string, subType: string): void;
}>();

const isCsvDialogOpen = ref(false);
const headers = ref<string[]>([]);
const parsedData = ref<Record<string, any>[]>([]);
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

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

const extractFile = (input: any): File | null => {
  if (input instanceof File) return input;
  if (input instanceof FileList && input.length > 0) return input[0];
  if (Array.isArray(input) && input.length > 0) return input[0];
  return null;
};

const handleFile = (file: File) => {
  if (!isValidCsvFile(file)) {
    displayErrorMessage(t('import.errors.invalidFile'), t('import.errors.onlyCsvAllowed'));
    resetFileInput();
    return;
  }
  processFile(file);
};

const handleFileUpload = (files: any) => {
  const file = extractFile(files);
  if (!file) {
    console.error('Unsupported file input type:', files);
    return;
  }
  handleFile(file);
};

const handleNativeInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    handleFile(input.files[0]);
  }
};

const processFile = async (file: File) => {
  if (isProcessing.value || !file) return;

  isProcessing.value = true;
  try {
    const result = await parseCsv(file);
    headers.value = result.value.headers;
    parsedData.value = result.value.records;
    isCsvDialogOpen.value = true;
    resetFileInput();
  } catch (error) {
    console.error('Error processing CSV file:', error);
    displayErrorMessage(t('import.errors.processingFailed'), String(error));
    resetFileInput();
  } finally {
    isProcessing.value = false;
  }
};

const handleNavigate = (objectType: string, subType: string) => {
  emit('navigate', objectType, subType);
};
</script>

<i18n>
{
  "en": {
    "import.title": "Import Items",
    "import.dropzone.label": "Drag and drop a CSV file here",
    "import.button.browse": "Browse Files",
    "import.or.text": "or select from your device",
    "import.errors.invalidFile": "Invalid File Type",
    "import.errors.onlyCsvAllowed": "Only CSV files are allowed. Please select a file with .csv extension.",
    "import.errors.processingFailed": "Error Processing File"
  },
  "de": {
    "import.title": "Elemente importieren",
    "import.dropzone.label": "CSV-Datei hierher ziehen und ablegen",
    "import.button.browse": "Dateien auswählen",
    "import.or.text": "oder von Ihrem Gerät auswählen",
    "import.errors.invalidFile": "Ungültiger Dateityp",
    "import.errors.onlyCsvAllowed": "Es sind nur CSV-Dateien erlaubt. Bitte wählen Sie eine Datei mit der Endung .csv.",
    "import.errors.processingFailed": "Fehler bei der Verarbeitung der Datei"
  }
}
</i18n>

<style scoped>
.import-container {
  margin-bottom: 2rem;
}

.upload-card {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.drop-zone-active {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
}

.hidden-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
::v-deep(.v-divider__content) {
  color: #555555 !important;
}
</style>
