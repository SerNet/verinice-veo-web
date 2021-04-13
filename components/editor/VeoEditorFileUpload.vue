<template>
  <VeoTabs>
    <template #tabs>
      <v-tab>{{ $t('import_file') }}</v-tab>
      <v-tab>{{ $t('import_code') }}</v-tab>
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
            @change="onChange"
            :loading="uploading"
            :label="inputLabel"
            :disabled="uploading"
          />
        </v-form>
      </v-tab-item>
      <v-tab-item>
        <VeoSchemaCodeEditor :value="code" @schema-updated="sendSchema" />
      </v-tab-item>
    </template>
  </VeoTabs>
</template>
<script lang="ts">
import Vue from 'vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { IVeoObjectSchema, IVeoFormSchema } from '~/types/VeoTypes'

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
    submitButtonText: {
      type: String,
      default: ''
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
    }
  },
  computed: {
    buttonText(): string {
      return this.submitButtonText || (this.$t('button_text') as string)
    }
  },
  watch: {
    clearInput(newValue) {
      if(newValue) {
        this.file = undefined
        this.$emit('update:clearInput')
      }
    }
  },
  methods: {
    async onChange(event: any) {
      this.uploading = true
      // 3 seconds delay to better visualise uploading process if a file is very small
      if (event) {
        await this.delay(2000)
      }
      this.doUpload()
      this.uploading = false
    },
    delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    doUpload() {
      if (this.file) {
        // Init file reader
        const fr = new FileReader()

        // Register callback upon successfull file upload
        fr.onload = event => {
          const result = JSON.parse((event.target?.result as string) || '{}')
          this.sendSchema(result)
        }
        fr.onerror = _ => {
          this.$root.$emit(VeoEvents.ALERT_ERROR, { title: this.$t('upload_error'), text: fr.error })
        }

        // Read file
        fr.readAsText(this.file)
      }
    },
    sendSchema(schema: IVeoObjectSchema | IVeoFormSchema) {
      this.$emit('schema-uploaded', schema)
    }
  }
})
</script>

<i18n>
{
  "en": {
    "button_text": "Upload",
    "import_code": "Paste code",
    "import_file": "Upload file",
    "upload_error": "Error while uploading file"
  },
  "de": {
    "button_text": "Hochladen",
    "import_code": "Code einfügen",
    "import_file": "Datei hochladen",
    "upload_error": "Fehler beim Dateiupload"
  }
}
</i18n>
