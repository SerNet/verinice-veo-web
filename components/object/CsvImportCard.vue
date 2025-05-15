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
          @update:model-value="handleFileChange"
          @click="triggerFileUpload"
        >
          <template #browse="{ props }">
            <v-btn color="primary" class="browse-button" size="large" flat @click="props.onClick">
              {{ t('import.button.browse') }}
            </v-btn>
          </template>
          <template #item="{ props: itemProps }">
            <v-file-upload-item v-bind="itemProps" lines="one" nav> </v-file-upload-item>
          </template>
        </v-file-upload>

        <input ref="fileInputRef" type="file" accept=".csv" style="display: none" @change="handleFileChange" />
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

const { t } = useI18n();
const { parseCsv } = useCsvImporter();

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
  fileInputRef.value?.click();
};

const processFile = async (file: File) => {
  try {
    // Process the CSV data
    const result = await parseCsv(file);

    // Set data and open dialog
    headers.value = result.value.headers;
    parsedData.value = result.value.records;
    isCsvDialogOpen.value = true;
  } catch (error) {
    console.error('Error processing CSV file:', error);
  }
};

// Upload is returning a list even though multiple is false. This should be in vuetify fixed in newer verions
// Using any as a workaround
const handleFileChange = (input: any) => {
  if (input instanceof File) {
    processFile(input);
  } else if (input instanceof Event) {
    const target = input.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      processFile(file);
    }
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
    "import.or.text": "or select from your device"
  },
  "de": {
    "import.title": "Elemente importieren",
    "import.dropzone.label": "CSV-Datei hierher ziehen und ablegen",
    "import.button.browse": "Dateien auswählen",
    "import.or.text": "oder von Ihrem Gerät auswählen"
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
  border-radius: 4px;
  text-align: center;

  cursor: pointer;
  transition: all 0.3s ease;
}

.drop-zone-active {
  border-color: #c62828;
  background-color: rgba(198, 40, 40, 0.05);
}

.drop-text {
  color: #888;
  font-size: 18px;
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
</style>
