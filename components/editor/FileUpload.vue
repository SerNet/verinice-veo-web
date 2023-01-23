<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <BaseTabs>
    <template #tabs>
      <v-tab>{{ t('importFile') }}</v-tab>
      <v-tab>{{ t('importCode') }}</v-tab>
    </template>
    <template #items>
      <v-window-item>
        <v-form class="mt-4">
          <v-file-input
            v-model="file"
            accept=".json"
            counter
            dense
            outlined
            show-size
            :loading="uploading"
            :label="inputLabel"
            :disabled="uploading"
            @update:model-value="onChange"
          />
        </v-form>
      </v-window-item>
      <v-window-item>
        <EditorsSchemaCodeEditor
          :model-value="code"
          :submit-button-text="submitButtonText"
          @schema-updated="sendSchema"
        />
      </v-window-item>
    </template>
  </BaseTabs>
</template>
<script lang="ts" setup>
import { IVeoObjectSchema, IVeoFormSchema } from '~/types/VeoTypes';

defineProps({
  code: {
    type: String,
    default: ''
  },
  inputLabel: {
    type: String,
    required: true
  },
  submitButtonText: {
    type: String,
    default: undefined
  }
});

const emit = defineEmits(['schema-uploaded']);

const { displayErrorMessage } = useVeoAlerts();
const { t } = useI18n();

const file = ref<File[]>();
const uploading = ref(false);

const onChange = async (event: any) => {
  uploading.value = true;
  // 3 seconds delay to better visualise uploading process if a file is very small
  if (event) {
    await delay(2000);
  }
  doUpload();
  uploading.value = false;
};

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const doUpload = () => {
  if (file.value?.[0]) {
    // Init file reader
    const fr = new FileReader();

    // Register callback upon successfull file upload
    fr.onload = (event) => {
      const result = JSON.parse((event.target?.result as string) || '{}');
      sendSchema(result);
    };
    fr.onerror = (_) => {
      displayErrorMessage(t('uploadError'), fr.error as any);
    };

    // Read file
    fr.readAsText(file.value?.[0]);
  }
};

const sendSchema = (schema: IVeoObjectSchema | IVeoFormSchema) => {
  emit('schema-uploaded', schema);
};
</script>

<i18n>
{
  "en": {
    "importCode": "Paste code",
    "importFile": "Upload file",
    "uploadError": "Error while uploading file"
  },
  "de": {
    "importCode": "Code einfügen",
    "importFile": "Datei hochladen",
    "uploadError": "Fehler beim Dateiupload"
  }
}
</i18n>
