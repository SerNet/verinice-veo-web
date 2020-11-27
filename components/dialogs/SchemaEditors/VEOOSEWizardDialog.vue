<template>
  <VeoDialog v-model="dialog" large :headline="$t('editor.objectschema.headline')" close-hidden persistent fixed-header fixed-footer>
    <template #default>
      <v-window v-model="state">
        <v-window-item value="start" class="py-8">
          <h2 class="text-center my-8">{{ $t('editor.objectschema.wizard.start.title') }}</h2>
          <v-row class="text-center">
            <v-col>
              <v-btn color="primary" @click="state = 'create'">
                {{ $t('editor.objectschema.wizard.create') }}
              </v-btn>
            </v-col>
            <v-col>
              <v-btn color="primary" @click="state = 'import'">
                {{ $t('editor.objectschema.wizard.import') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-window-item>
        <v-window-item value="create">
          <v-form v-model="createForm.valid" @submit.prevent="createSchema()">
            <v-row no-gutters class="align-center mt-4">
              <v-col :cols="12" :md="5">
                <span style="font-size: 1.2rem;">{{ $t('editor.objectschema.create.type.text') }}*:</span>
              </v-col>
              <v-col :cols="12" :md="5">
                <v-text-field v-model="createForm.type" :label="$t('editor.objectschema.create.type')" :rules="createForm.rules.type" required />
              </v-col>
            </v-row>
            <v-row no-gutters class="align-center mt-4">
              <v-col :cols="12" :md="5">
                <span style="font-size: 1.2rem;">{{ $t('editor.objectschema.create.description.text') }}*:</span>
              </v-col>
              <v-col :cols="12" :md="5">
                <v-text-field v-model="createForm.description" :label="$t('editor.objectschema.create.description')" :rules="createForm.rules.description" required />
              </v-col>
            </v-row>
          </v-form>
          <small>{{ $t('editor.dialog.requiredfields') }}</small>
        </v-window-item>
        <v-window-item value="import" class="px-4">
          <v-tabs v-model="activeTab">
            <v-tab>Datei hochladen</v-tab>
            <v-tab>Code einfügen</v-tab>
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
                  label="Schema hochladen (.json)"
                  :disabled="uploading"
                />
                <v-row class="ml-6">
                  <v-col cols="auto">
                    <v-btn
                      role="submit"
                      type="submit"
                      color="primary"
                      :disabled="uploading || !file"
                    >
                      Schema importieren
                    </v-btn>
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
              <CodeEditor v-model="code" @schema-updated="createSchema" />
            </v-tab-item>
          </v-tabs-items>
        </v-window-item>
      </v-window>
    </template>
    <template #dialog-options>
      <span />
      <v-btn v-if="state !== 'start'" color="primary" @click="state = 'start'">
        {{ $t('global.button.previous') }}
      </v-btn>
      <v-spacer />
      <v-btn v-if="state === 'create'" color="primary" role="submit" type="submit" :disabled="!createForm.valid" @click="createSchema()">
        {{ $t('global.button.next') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { trim } from 'lodash'

import { generateSchema } from '~/lib/ObjectSchemaHelper'
import VeoDialog from '~/components/dialogs/VeoDialog.vue'
import CodeEditor from '~/components/CodeEditor.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'

export default Vue.extend({
  components: {
    VeoDialog,
    CodeEditor
  },
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      dialog: false as boolean,
      noWatch: false as boolean,
      state: 'start' as 'start' | 'import' | 'create',
      createForm: {
        type: '' as string,
        description: '' as string,
        valid: false,
        rules: {
          type: [(input: string) => trim(input).length > 0],
          description: [(input: string) => trim(input).length > 0]
        }
      },
      code: '\n\n\n\n\n' as string,
      activeTab: 0 as number,
      file: undefined as File | undefined,
      uploading: false as boolean
    }
  },
  watch: {
    dialog(newValue: boolean) {
      if (newValue) {
        this.state = 'start'
      }
      if (!this.noWatch) {
        this.$emit('input', newValue)
      }
    },
    value(newValue: boolean) {
      this.noWatch = true
      this.dialog = newValue
      this.noWatch = false
    },
    state(newValue) {
      if (newValue === 'start') {
        this.code = ''
        this.clearCreateForm()
      }
    }
  },
  mounted() {
    this.dialog = this.value
  },
  methods: {
    createSchema(_schema?: any) {
      if (this.state === 'create') {
        const schema = generateSchema(this.createForm.type.toLowerCase(), this.createForm.description)
        this.$emit('schema', schema)
      } else {
        this.$emit('schema', _schema)
      }
    },
    clearCreateForm() {
      this.createForm = {
        type: '' as string,
        description: '' as string,
        valid: false,
        rules: {
          type: [(input: string) => trim(input).length > 0],
          description: [(input: string) => trim(input).length > 0]
        }
      }
    },
    doUpload() {
      this.uploading = true

      if (this.file) {
        // Init file reader
        const fr = new FileReader()

        // Register callback upon successfull file upload
        fr.onload = (event) => {
          const result = JSON.parse(event.target?.result as string || '{}')
          this.$emit('schema', result)
          this.uploading = false
        }
        fr.onerror = (_) => {
          this.$root.$emit(VeoEvents.SNACKBAR_ERROR, `Upload Error: ${fr.error}`)
          this.uploading = false
        }

        // Read file
        fr.readAsText(this.file)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
