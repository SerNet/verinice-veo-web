<template>
  <VeoDialog
    v-model="dialog"
    :large="state !== 'start'"
    :headline="$t('editor.formschema.headline')"
    persistent
    fixed-header
    fixed-footer
    :close-function="onClose"
  >
    <template #default>
      <v-window v-model="state">
        <v-window-item value="start" class="py-4">
          <h2>
            {{ $t('editor.objectschema.wizard.start.title') }}
          </h2>
          <v-list two-line class="px-0 overflow-hidden">
            <v-list-item @click="state = 'create-1'">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ $t('editor.formschema.wizard.create') }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ $t('editor.formschema.wizard.create.description') }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon x-large>mdi-chevron-right</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-list-item @click="state = 'import-1'">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ $t('editor.formschema.wizard.import') }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ $t('editor.formschema.wizard.import.description') }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon x-large>mdi-chevron-right</v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-window-item>
        <v-window-item value="create-1" class="px-4">
          <h2>{{ $t('editor.formschema.wizard.create') }}</h2>
          <v-form v-model="createForm.valid" @submit.prevent="doCreate1()">
            <v-row no-gutters class="align-center mt-4">
              <v-col :cols="12" :md="5">
                <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.create.title.text') }}*: </span>
              </v-col>
              <v-col :cols="12" :md="5">
                <v-text-field
                  :value="createForm.title"
                  :label="$t('editor.formschema.create.title')"
                  :rules="createForm.rules.title"
                  @input="formatSchemaName"
                  required
                />
              </v-col>
            </v-row>
            <v-row no-gutters class="align-center mt-4">
              <v-col :cols="12" :md="5">
                <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.subtype') }}: </span>
              </v-col>
              <v-col :cols="12" :md="5">
                <v-text-field v-model="createForm.subType" :label="$t('editor.formschema.subtype')" />
              </v-col>
            </v-row>
            <v-row no-gutters class="align-center mt-4">
              <v-col :cols="12" :md="5">
                <span style="font-size: 1.2rem;"> {{ $t('editor.formschema.create.type.text') }}*: </span>
              </v-col>
              <v-col :cols="12" :md="5">
                <v-select
                  v-model="createForm.modelType"
                  :label="$t('editor.formschema.create.type')"
                  :rules="createForm.rules.modelType"
                  :items="objectTypes"
                  required
                />
              </v-col>
            </v-row>
            <v-row v-if="createForm.modelType === 'custom'">
              <v-col :cols="12">
                <VEOEditorFileUpload
                  :code="oscode"
                  :input-label="$t('editor.objectschema.upload.input.file.label')"
                  :submit-button-text="$t('editor.objectschema.wizard.import')"
                  @schema-uploaded="setObjectSchema"
                />
              </v-col>
            </v-row>
          </v-form>
          <small>{{ $t('editor.dialog.requiredfields') }}</small>
        </v-window-item>
        <v-window-item value="create-2" class="px-4">
          <h2 class="text-center my-8">
            {{ $t('editor.formschema.wizard.generate.title') }}
          </h2>
          <v-row class="text-center">
            <v-col>
              <v-btn color="primary" outlined text @click="doCreate2(false)">
                {{ $t('editor.formschema.wizard.generate.none') }}
              </v-btn>
            </v-col>
            <v-col>
              <v-btn color="primary" outlined text @click="doCreate2(true)">
                {{ $t('editor.formschema.wizard.generate.generate') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-window-item>
        <v-window-item value="import-1" class="px-4">
          <h2>{{ $t('editor.formschema.wizard.import') }}</h2>
          <p>{{ $t('import.help1') }}</p>
          <VEOEditorFileUpload
            :code="fscode"
            :input-label="$t('editor.formschema.upload.input.file.label')"
            :clear-input.sync="clearInput"
            @schema-uploaded="doImport1"
          />
          <v-checkbox v-model="forceOwnSchema" :label="$t('editor.formschema.wizard.forceownschema')" />
        </v-window-item>
        <v-window-item value="import-2">
          <h2>{{ $t('editor.objectschema.wizard.import') }}</h2>
          <p>{{ $t('import.help2') }}</p>
          <VeoAlert
            v-model="invalidOS"
            :type="1"
            :title="$t('editor.formschema.wizard.invalidos')"
            :text="$t('editor.formschema.wizard.invalidos.content')"
            class="my-4"
            flat
            no-close-button
          />
          <VEOEditorFileUpload
            :code="oscode"
            :input-label="$t('editor.objectschema.upload.input.file.label')"
            @schema-uploaded="doImport2"
          />
        </v-window-item>
      </v-window>
    </template>
    <template #dialog-options>
      <span />
      <v-btn v-if="state !== 'start'" text color="primary" @click="goBack()">
        {{ $t('global.button.previous') }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="state === 'create-1'"
        color="primary"
        role="submit"
        type="submit"
        text
        :disabled="!createForm.valid || (createForm.modelType === 'custom' && !objectSchema)"
        @click="doCreate1()"
      >
        {{ $t('global.button.next') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<i18n>
{
  "de": {
    "import.help1": "Laden Sie hier das Formschema hoch, das Sie Bearbeiten möchten.",
    "import.help2": "Laden Sie hier das Objektschema hoch, auf dem das Formschema basiert."
  },
  "en": {
    "import.help1": "Upload the form schema you want to edit.",
    "import.help2": "Upload the object schema the form schema is based on."
  }
}
</i18n>
<script lang="ts">
import Vue from 'vue'
import { capitalize, trim } from 'lodash'

import { IVEOFormSchema } from 'veo-formschema'
import { generateSchema, validate } from '~/lib/FormSchemaHelper'
import VeoDialog from '~/components/dialogs/VeoDialog.vue'
import VEOEditorFileUpload from '~/components/editor/VEOEditorFileUpload.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { ISchemaEndpoint } from '~/plugins/api/schema'
import { IVeoObjectSchema } from '~/types/VeoTypes'

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
        subType: null as string | null,
        valid: false,
        rules: {
          title: [(input: string) => trim(input).length > 0],
          modelType: [(input: string) => trim(input).length > 0]
        }
      },
      oscode: '\n\n\n\n\n' as string,
      fscode: '\n\n\n\n\n' as string,
      formSchema: undefined as IVEOFormSchema | undefined,
      objectSchema: undefined as IVeoObjectSchema | undefined,
      state: 'start' as 'start' | 'create-1' | 'create-2' | 'import-1' | 'import-2',
      schemas: [] as ISchemaEndpoint[],
      invalidOS: false as boolean,
      forceOwnSchema: false as boolean,
      clearInput: false as boolean
    }
  },
  computed: {
    objectTypes(): { text: string; value: string }[] {
      return [
        {
          text: this.$t('editor.formschema.wizard.modelType.custom') as string,
          value: 'custom'
        },
        ...this.schemas.map((entry: ISchemaEndpoint) => {
          return {
            text: capitalize(entry.schemaName),
            value: entry.schemaName
          }
        })
      ]
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

    this.$api.schema.fetchAll().then((data: ISchemaEndpoint[]) => (this.schemas = data))
  },
  methods: {
    goBack() {
      if (this.state === 'create-1' || this.state === 'import-1') {
        this.state = 'start'
      } else if (this.state === 'create-2') {
        if(this.createForm.modelType !== 'custom') {
          this.objectSchema = undefined
        }
        
        this.state = 'create-1'
      } else if (this.state === 'import-2') {
        this.fscode = ''
        this.oscode = ''
        this.clearInput = true
        this.state = 'import-1'
      }
    },
    // Create/load object schema and proceed to step 1
    async doCreate1() {
      // Only proceed if an object schema was uploaded/pasted (we sadly can't validate it in the form, so we have to to it here)
      if (this.objectSchema || this.createForm.modelType !== 'custom') {
        if (this.createForm.modelType !== 'custom') {
          this.objectSchema = await this.$api.schema.fetch(this.createForm.modelType)
        }
        this.state = 'create-2'
      } else {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          text: this.$t('editor.formschema.wizard.objectschema.required')
        })
      }
    },
    doCreate2(_generateSchema: boolean) {
      const _subtype =
        !this.createForm.subType || trim(this.createForm.subType).length == 0 ? null : this.createForm.subType
      this.formSchema = generateSchema(
        this.createForm.title,
        this.objectSchema?.title || this.createForm.modelType,
        _subtype
      )
      this.$emit('form-schema', this.formSchema)
      this.$emit('object-schema', this.objectSchema)
    },
    // Load a form schema, if its model type is existing in the database, the wizard is done, else the object schema has to get imported.
    async doImport1(schema: IVEOFormSchema) {
      this.setFormSchema(schema)
      if (
        !this.forceOwnSchema &&
        this.objectTypes.findIndex(
          (item: { value: string; text: string }) => item.value.toLowerCase() === schema.modelType?.toLowerCase()
        ) !== -1
      ) {
        this.objectSchema = await this.$api.schema.fetch(schema.modelType?.toLowerCase())

        /* Checks whether the form schema fits the object schema. If not, we assume that the object schema the
         * user used for this form schema is a modified version of an existing object schema and ask him to provide it.
         */
        if (!validate(schema, this.objectSchema).valid) {
          this.invalidOS = true
          this.state = 'import-2'
        } else {
          this.$emit('form-schema', this.formSchema)
          this.$emit('object-schema', this.objectSchema)
        }
      } else {
        this.state = 'import-2'
      }
    },
    // Load a form schema, if its model type is existing in the database, the wizard is done, else the object schema has to get imported.
    doImport2(schema: IVeoObjectSchema) {
      if (schema.title !== this.formSchema?.modelType) {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          text: this.$t('editor.formschema.wizard.import.wrongobjectschema', {
            objectType: schema.title,
            formType: this.formSchema?.modelType
          })
        })
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
        subType: null as string | null,
        valid: false,
        rules: {
          title: [(input: string) => trim(input).length > 0],
          modelType: [(input: string) => trim(input).length > 0]
        }
      }
    },
    setObjectSchema(schema: IVeoObjectSchema) {
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
    },
    formatSchemaName(val: string) {
      this.createForm.title = val.toLowerCase()
    }
  }
})
</script>

<style lang="scss" scoped>
.v-list-item__subtitle {
  white-space: pre-wrap;
}
</style>
