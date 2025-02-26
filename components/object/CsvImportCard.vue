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
      <v-card class="upload-card">
        <v-card-title class="text-h6">{{ t('import.title') }}</v-card-title>

        <div
          class="drop-zone pa-8"
          :class="{ 'drag-active': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleFileDrop"
          @click="triggerFileUpload"
        >
          <v-icon large class="mb-2">mdi-file-import</v-icon>
          <div class="text-body-1 mb-4">{{ t('import.dropzone.label') }}</div>
          <v-btn color="primary" @click.stop="triggerFileUpload">{{ t('import.button.browse') }}</v-btn>
        </div>

        <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="handleFileChange" />
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

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const isCsvDialogOpen = ref(false);
const headers = ref<string[]>([]);
const parsedData = ref<Record<string, any>[]>([]);

const triggerFileUpload = () => {
  fileInput.value?.click();
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

const handleFileDrop = (event: DragEvent) => {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

const handleNavigate = (objectType: string, subType: string) => {
  emit('navigate', objectType, subType);
};
</script>

<i18n>
{
  "en": {
    "import.title": "Import Elements",
    "import.dropzone.label": "Drag and drop CSV file here",
    "import.button.browse": "Browse Files"
  },
  "de": {
    "import.title": "Elemente importieren",
    "import.dropzone.label": "Ziehen Sie die CSV-Datei hierher",
    "import.button.browse": "Dateien durchsuchen"
  }
}
</i18n>

<style scoped>
.import-container {
  margin-bottom: 2rem;
}

.upload-card {
  max-width: 500px;
  margin: 0 auto;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.drag-active {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
}

.hidden {
  display: none;
}
</style>
