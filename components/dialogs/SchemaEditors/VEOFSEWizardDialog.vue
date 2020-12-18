<template>
  <VeoDialog v-model="dialog" :large="state !== 'start'" :headline="$t('editor.formschema.headline')" persistent fixed-header fixed-footer :close-function="onClose">
    <template #default>
      <v-window v-model="state">
        <v-window-item value="start" class="py-8">
          <h2 class="text-center my-8">{{ $t('editor.objectschema.wizard.start.title') }}</h2>
          <v-list two-line class="px-0 overflow-hidden">
            <v-list-item @click="state = 'create-1'">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{ $t('editor.formschema.wizard.create') }}</v-list-item-title>
                <v-list-item-subtitle>{{ $t('editor.formschema.wizard.create.description') }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><v-icon x-large>mdi-chevron-right</v-icon></v-list-item-action>
            </v-list-item>
            <v-list-item @click="state = 'import-1'">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{ $t('editor.formschema.wizard.import') }}</v-list-item-title>
                <v-list-item-subtitle>{{ $t('editor.formschema.wizard.import.description') }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><v-icon x-large>mdi-chevron-right</v-icon></v-list-item-action>
            </v-list-item>
          </v-list>
        </v-window-item>
        <v-window-item value="create-1">
          <v-form v-model="createForm.valid" @submit.prevent="doCreate1()">
            <v-row no-gutters class="align-center mt-4">
              <v-col :cols="12" :md="5">
                <span style="font-size: 1.2rem;">{{ $t('editor.formschema.create.title.text') }}*:</span>
              </v-col>
              <v-col :cols="12" :md="5">
                <v-text-field v-model="createForm.title" :label="$t('editor.formschema.create.title')" :rules="createForm.rules.title" required />
              </v-col>
            </v-row>
            <v-row no-gutters class="align-center mt-4">
              <v-col :cols="12" :md="5">
                <span style="font-size: 1.2rem;">{{ $t('editor.formschema.create.type.text') }}*:</span>
              </v-col>
              <v-col :cols="12" :md="5">
                <v-select v-model="createForm.modelType" :label="$t('editor.formschema.create.type')" :rules="createForm.rules.modelType" :items="objectTypes" required />
              </v-col>
            </v-row>
            <v-row v-if="createForm.modelType === 'custom'">
              <v-col :cols="12">
                <VEOEditorFileUpload :code="oscode" :submit-button-text="$t('editor.objectschema.wizard.import')" @schema-uploaded="setObjectSchema" />
              </v-col>
            </v-row>
          </v-form>
          <small>{{ $t('editor.dialog.requiredfields') }}</small>
        </v-window-item>
        <v-window-item value="create-2">
          <h2 class="text-center my-8">{{ $t('editor.formschema.wizard.generate.title') }}wie starten</h2>
          <v-row class="text-center">
            <v-col>
              <v-btn color="primary" @click="doCreate2(false)">
                {{ $t('editor.formschema.wizard.generate.none') }}
              </v-btn>
            </v-col>
            <v-col>
              <v-btn color="primary" @click="doCreate2(true)">
                {{ $t('editor.formschema.wizard.generate.generate') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-window-item>
        <v-window-item value="import-1">
          <h2>{{ $t('editor.formschema.wizard.import') }}</h2>
          <VEOEditorFileUpload :code="fscode" @schema-uploaded="doImport1" />
        </v-window-item>
        <v-window-item value="import-2">
          <h2>{{ $t('editor.objectschema.wizard.import') }}</h2>
          <VEOEditorFileUpload :code="oscode" @schema-uploaded="doImport2" />
        </v-window-item>
      </v-window>
    </template>
    <template #dialog-options>
      <span />
      <v-btn v-if="state !== 'start'" color="primary" @click="goBack()">
        {{ $t('global.button.previous') }}
      </v-btn>
      <v-spacer />
      <v-btn v-if="state === 'create-1'" color="primary" role="submit" type="submit" :disabled="!createForm.valid || (createForm.modelType === 'custom' && !objectSchema)" @click="doCreate1()">
        {{ $t('global.button.next') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { trim } from 'lodash'

import { VEOObjectSchemaRAW } from 'veo-objectschema-7'
import { IVEOFormSchema } from 'veo-formschema'
import { generateSchema } from '~/lib/FormSchemaHelper'
import VeoDialog from '~/components/dialogs/VeoDialog.vue'
import CodeEditor from '~/components/CodeEditor.vue'
import VEOEditorFileUpload from '~/components/editor/VEOEditorFileUpload.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'

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
      createForm: {
        title: '' as string,
        modelType: '' as string,
        valid: false,
        rules: {
          title: [(input: string) => trim(input).length > 0],
          modelType: [(input: string) => trim(input).length > 0]
        }
      },
      oscode: '\n\n\n\n\n' as string,
      fscode: '\n\n\n\n\n' as string,
      formSchema: undefined as IVEOFormSchema | undefined,
      objectSchema: undefined as VEOObjectSchemaRAW | undefined,
      state: 'start' as 'start' | 'create-1' | 'create-2' | 'import-1' | 'import-2',
      objectTypes: [] as {value: string, text: string}[]
    }
  },
  watch: {
    dialog(newValue: boolean) {
      if (newValue) {
        // this.state = 'step1'
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
        this.oscode = '\n\n\n\n\n'
        this.objectSchema = undefined
        this.fscode = '\n\n\n\n\n'
        this.formSchema = undefined
        this.clearCreateForm()
      }
    }
  },
  mounted() {
    this.dialog = this.value

    this.$api.schema.fetchAll().then(data => data.knownSchemas.map((value: string) => {
      return {
        text: this.$t(`unit.data.type.${value}`) as string,
        value
      }
    })).then((types) => {
      types.unshift({ text: this.$t('editor.formschema.wizard.modelType.custom') as string, value: 'custom' })
      this.objectTypes = types
    })
  },
  methods: {
    goBack() {
      if (this.state === 'create-1' || this.state === 'import-1') {
        this.state = 'start'
      } else if (this.state === 'create-2') {
        this.state = 'create-1'
      } else if (this.state === 'import-2') {
        this.state = 'import-1'
      }
    },
    // Create/load object schema and proceed to step 1
    async doCreate1() {
      // Only proceed if an object schema was uploaded/pasted (we sadly can't validate it in the form, so we have to to it here)
      if (this.objectSchema || this.createForm.modelType !== 'custom') {
        if (!this.objectSchema) {
          this.objectSchema = await this.$api.schema.fetch(this.createForm.modelType)
        }
        this.state = 'create-2'
      } else {
        this.$root.$emit(VeoEvents.ALERT_ERROR, { text: this.$t('editor.formschema.wizard.objectschema.required') })
      }
    },
    doCreate2(_generateSchema: boolean) {
      this.formSchema = generateSchema(this.createForm.title, this.objectSchema?.title || this.createForm.modelType)
      this.$emit('form-schema', this.formSchema)
      this.$emit('object-schema', this.objectSchema)
    },
    // Load a form schema, if its model type is existing in the database, the wizard is done, else the object schema has to get imported.
    async doImport1(schema: IVEOFormSchema) {
      this.setFormSchema(schema)
      if (this.objectTypes.findIndex((item: { value: string, text: string }) => item.value.toLowerCase() === schema.modelType.toLowerCase()) !== -1) {
        this.objectSchema = await this.$api.schema.fetch(schema.modelType.toLowerCase())
        this.$emit('form-schema', this.formSchema)
        this.$emit('object-schema', this.objectSchema)
      } else {
        this.state = 'import-2'
      }
    },
    // Load a form schema, if its model type is existing in the database, the wizard is done, else the object schema has to get imported.
    doImport2(schema: VEOObjectSchemaRAW) {
      if (schema.title !== this.formSchema?.modelType) {
        this.$root.$emit(VeoEvents.ALERT_ERROR, { text: this.$t('editor.formschema.wizard.import.wrongobjectschema', { objectType: schema.title, formType: this.formSchema?.modelType }) })
      } else {
        this.setObjectSchema(schema)
        this.$emit('form-schema', this.formSchema)
        this.$emit('object-schema', this.objectSchema)
      }
    },
    clearCreateForm() {
      this.createForm = {
        title: '' as string,
        modelType: '' as string,
        valid: false,
        rules: {
          title: [(input: string) => trim(input).length > 0],
          modelType: [(input: string) => trim(input).length > 0]
        }
      }
    },
    setObjectSchema(schema: VEOObjectSchemaRAW) {
      this.oscode = JSON.stringify(schema, undefined, 2)
      this.objectSchema = schema
    },
    setFormSchema(schema: IVEOFormSchema) {
      this.fscode = JSON.stringify(schema, undefined, 2)
      this.formSchema = schema
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
