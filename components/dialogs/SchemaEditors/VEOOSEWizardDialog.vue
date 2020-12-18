<template>
  <VeoDialog v-model="dialog" :large="state !== 'start'" :headline="$t('editor.objectschema.headline')" persistent fixed-header fixed-footer :close-function="onClose">
    <template #default>
      <v-window v-model="state">
        <v-window-item value="start" class="py-2">
          <h2 class="text-center my-2">{{ $t('editor.objectschema.wizard.start.title') }}</h2>
          <v-list two-line class="px-0 overflow-hidden">
            <v-list-item @click="state = 'create'">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{ $t('editor.objectschema.wizard.create') }}</v-list-item-title>
                <v-list-item-subtitle>{{ $t('editor.objectschema.wizard.create.description') }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><v-icon x-large>mdi-chevron-right</v-icon></v-list-item-action>
            </v-list-item>
            <v-list-item @click="state = 'import'">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{ $t('editor.objectschema.wizard.import') }}</v-list-item-title>
                <v-list-item-subtitle>{{ $t('editor.objectschema.wizard.import.description') }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><v-icon x-large>mdi-chevron-right</v-icon></v-list-item-action>
            </v-list-item>
          </v-list>
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
          <VEOEditorFileUpload :code="code" @schema-uploaded="createSchema" />
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
import VEOEditorFileUpload from '~/components/editor/VEOEditorFileUpload.vue'

export default Vue.extend({
  components: {
    VeoDialog,
    VEOEditorFileUpload
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
      code: '\n\n\n\n\n' as string
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
    onClose() {
      this.$router.push('/editor')
      return true
    }
  }
})
</script>

<style lang="scss" scoped>
.v-list-item__subtitle {
  white-space: pre-wrap;
}
</style>
