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
  <VeoTabs>
    <template #tabs>
      <v-tab>{{ $t('importFile') }}</v-tab>
      <v-tab>{{ $t('importCode') }}</v-tab>
    </template>
    <template #items>
      <v-tab-item>
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
            @change="onChange"
          />
        </v-form>
      </v-tab-item>
      <v-tab-item>
        <VeoSchemaCodeEditor
          :value="code"
          @schema-updated="sendSchema"
        />
      </v-tab-item>
    </template>
  </VeoTabs>
</template>
<script lang="ts">
import Vue from 'vue';
import { VeoEvents } from '~/types/VeoGlobalEvents';
import { IVeoObjectSchema, IVeoFormSchema } from '~/types/VeoTypes';

export default Vue.extend({
  props: {
    code: {
      type: String,
      required: true
    },
    inputLabel: {
      type: String,
      required: true
    },
    clearInput: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      file: undefined as File | undefined,
      uploading: false as boolean
    };
  },
  watch: {
    clearInput(newValue) {
      if (newValue) {
        this.file = undefined;
        this.$emit('update:clearInput');
      }
    }
  },
  methods: {
    async onChange(event: any) {
      this.uploading = true;
      // 3 seconds delay to better visualise uploading process if a file is very small
      if (event) {
        await this.delay(2000);
      }
      this.doUpload();
      this.uploading = false;
    },
    delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    doUpload() {
      if (this.file) {
        // Init file reader
        const fr = new FileReader();

        // Register callback upon successfull file upload
        fr.onload = (event) => {
          const result = JSON.parse((event.target?.result as string) || '{}');
          this.sendSchema(result);
        };
        fr.onerror = (_) => {
          this.$root.$emit(VeoEvents.ALERT_ERROR, { title: this.$t('uploadError'), text: fr.error });
        };

        // Read file
        fr.readAsText(this.file);
      }
    },
    sendSchema(schema: IVeoObjectSchema | IVeoFormSchema) {
      this.$emit('schema-uploaded', schema);
    }
  }
});
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
