<template>
  <VeoTabs>
    <template #tabs>
      <v-tab>{{ $t('editor.upload.import.file') }}</v-tab>
      <v-tab>{{ $t('editor.upload.import.code') }}</v-tab>
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
            :label="`${$t('editor.upload.input.file.label')} (.json)`"
            :disabled="uploading"
          />
        </v-form>
      </v-tab-item>
      <v-tab-item>
        <CodeEditor :value="code" @schema-updated="sendSchema" />
      </v-tab-item>
    </template>
  </VeoTabs>
</template>
<script lang="ts">
import { IVEOFormSchema } from 'veo-formschema'
import { VEOObjectSchemaRAW } from 'veo-objectschema-7'
import Vue from 'vue'

import VeoTabs from '~/components/layout/VeoTabs.vue'
import CodeEditor from '~/components/CodeEditor.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'

export default Vue.extend({
  components: {
    CodeEditor,
    VeoTabs
  },
  props: {
    code: {
      type: String,
      required: true
    },
    submitButtonText: {
      type: String,
      default: ''
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
      return this.submitButtonText || (this.$t('editor.upload.button.text') as string)
    }
  },
  methods: {
    async onChange(event: any) {
      this.uploading = true
      await this.delay(3000)
      this.doUpload()
      // 3 seconds delay to better visualise uploading process if a file is very small
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
          this.$root.$emit(VeoEvents.ALERT_ERROR, { title: this.$t('editor.upload.error'), text: fr.error })
        }

        // Read file
        fr.readAsText(this.file)
      }
    },
    sendSchema(schema: VEOObjectSchemaRAW | IVEOFormSchema) {
      this.$emit('schema-uploaded', schema)
    }
  }
})
</script>
<style lang="scss" scoped></style>
