<template>
  <div>
    <v-tabs v-model="activeTab">
      <v-tab>{{ $t('editor.upload.import.file') }}</v-tab>
      <v-tab>{{ $t('editor.upload.import.code') }}</v-tab>
    </v-tabs>
    <v-tabs-items v-model="activeTab">
      <v-tab-item>
        <v-form
          class="mt-4"
          @submit.prevent="doUpload()"
        >
          <v-file-input
            v-model="file"
            accept=".json"
            counter
            dense
            outlined
            show-size
            :label="`${ $t('editor.upload.input.file.label')} (.json)`"
            :disabled="uploading"
          />
          <v-row class="ml-6">
            <v-col cols="auto">
              <v-btn
                role="submit"
                type="submit"
                color="primary"
                :disabled="uploading || !file"
                v-text="buttonText"
              />
            </v-col>
            <v-col cols="auto">
              <v-progress-circular
                v-if="uploading"
                indeterminate
                color="primary"
                class="mr-2"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-tab-item>
      <v-tab-item>
        <CodeEditor :value="code" @schema-updated="sendSchema" />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>
<script lang="ts">
import { IVEOFormSchema, VEOObjectSchemaRAW } from 'veo-objectschema-7'
import Vue from 'vue'

import CodeEditor from '~/components/CodeEditor.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'

export default Vue.extend({
  components: {
    CodeEditor
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
      activeTab: 0 as number,
      file: undefined as File | undefined,
      uploading: false as boolean
    }
  },
  computed: {
    buttonText(): string {
      return this.submitButtonText || this.$t('editor.upload.button.text') as string
    }
  },
  methods: {
    doUpload() {
      this.uploading = true

      if (this.file) {
        // Init file reader
        const fr = new FileReader()

        // Register callback upon successfull file upload
        fr.onload = (event) => {
          const result = JSON.parse(event.target?.result as string || '{}')
          this.sendSchema(result)
          this.uploading = false
        }
        fr.onerror = (_) => {
          this.$root.$emit(VeoEvents.SNACKBAR_ERROR, `${this.$t('editor.upload.error')}: ${fr.error}`)
          this.uploading = false
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
<style lang="scss" scoped>

</style>
