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
          <h2>{{ $t('start') }}</h2>
          <v-list two-line class="px-0 overflow-hidden">
            <v-list-item @click="state = 'create-1'">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{ $t('createFormSchema') }}</v-list-item-title>
                <v-list-item-subtitle>{{ $t('createFormSchemaDescription') }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon x-large>mdi-chevron-right</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-list-item @click="state = 'import-1'">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{ $t('importFormSchema') }}</v-list-item-title>
                <v-list-item-subtitle>{{ $t('importFormSchemaDescription') }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon x-large>mdi-chevron-right</v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-window-item>
        <v-window-item value="create-1" class="px-4">
          <h2>{{ $t('createFormSchema') }}</h2>
          <v-form v-model="createForm.valid" @submit.prevent="doCreate1()">
            <v-row no-gutters class="align-center mt-4">
              <v-col :cols="12" :md="5">
                <span style="font-size: 1.2rem;">{{ $t('editor.formschema.create.title.text') }}*:</span>
              </v-col>
              <v-col :cols="12" :md="5">
                <v-text-field
                  v-model="createForm.title"
                  :label="$t('editor.formschema.create.title')"
                  :rules="createForm.rules.title"
                  required
                />
              </v-col>
            </v-row>
            <v-row no-gutters class="align-center mt-4">
              <v-col :cols="12" :md="5">
                <span style="font-size: 1.2rem;">{{ $t('editor.formschema.subtype') }}:</span>
              </v-col>
              <v-col :cols="12" :md="5">
                <v-text-field
                  v-model="createForm.subType"
                  :label="$t('editor.formschema.subtype')"
                />
              </v-col>
            </v-row>
            <v-row no-gutters class="align-center mt-4">
              <v-col :cols="12" :md="5">
                <span style="font-size: 1.2rem;">{{ $t('editor.formschema.create.type.text') }}*:</span>
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
                <VeoEditorFileUpload
                  :code="oscode"
                  :input-label="$t('objectSchemaUploadLabel')"
                  :submit-button-text="$t('importObjectschema')"
                  @schema-uploaded="setObjectSchema"
                />
              </v-col>
            </v-row>
          </v-form>
          <small>{{ $t('global.input.requiredfields') }}</small>
        </v-window-item>
        <v-window-item value="import-1" class="px-4">
          <h2>{{ $t('importFormSchema') }}</h2>
          <p>{{ $t('importFormSchemaHelp') }}</p>
          <VeoEditorFileUpload
            :code="fscode"
            :input-label="$t('formSchemaUploadLabel')"
            :clear-input.sync="clearInput"
            @schema-uploaded="doImport1"
          />
          <v-checkbox v-model="forceOwnSchema" :label="$t('forceOwnSchema')" />
        </v-window-item>
        <v-window-item value="import-2">
          <h2>{{ $t('importObjectschema') }}</h2>
          <p>{{ $t('importObjectSchemaHelp') }}</p>
          <VeoAlert
            v-model="invalidOS"
            :type="1"
            :title="$t('invalidObjectSchema')"
            :text="$t('invalidObjectSchemaHint')"
            class="my-4"
            flat
            no-close-button
          />
          <VeoEditorFileUpload
            :code="oscode"
            :input-label="$t('objectSchemaUploadLabel')"
            @schema-uploaded="doImport2"
          />
        </v-window-item>
      </v-window>
    </template>
    <template #dialog-options>
      <span />
      <v-btn
        v-if="state !== 'start'"
        text
        color="primary"
        @click="goBack()"
      >{{ $t('global.button.previous') }}</v-btn>
      <v-spacer />
      <v-btn
        v-if="state === 'create-1'"
        color="primary"
        role="submit"
        type="submit"
        text
        :disabled="!createForm.valid || (createForm.modelType === 'custom' && !objectSchema)"
        @click="doCreate1()"
      >{{ $t('global.button.next') }}</v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { capitalize, trim } from 'lodash'

import { generateSchema, validate } from '~/lib/FormSchemaHelper'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { ISchemaEndpoint } from '~/plugins/api/schema'
import { IVeoTranslations, IVeoObjectSchema, IVeoFormSchema } from '~/types/VeoTypes'

export default Vue.extend({
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
      formSchema: undefined as IVeoFormSchema | undefined,
      objectSchema: undefined as IVeoObjectSchema | undefined,
      translation: undefined as IVeoTranslations | undefined,
      state: 'start' as 'start' | 'create-1' | 'import-1' | 'import-2',
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
          text: this.$t('customObjectSchema') as string,
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

    this.$api.schema.fetchAll(true).then((data: ISchemaEndpoint[]) => (this.schemas = data))
    this.$api.translation.fetch([]).then((translation: IVeoTranslations) => {
      this.translation = translation
    })
  },
  methods: {
    goBack() {
      if (this.state === 'create-1' || this.state === 'import-1') {
        this.state = 'start'
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
        this.doCreate2() // We removed the option to choose between an empty form or a generate one, thus we can directly call this method.
      } else {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          text: this.$t('objectSchemaRequired')
        })
      }
    },
    doCreate2() {
      const _subtype =
        !this.createForm.subType || trim(this.createForm.subType).length == 0 ? null : this.createForm.subType
      this.formSchema = generateSchema(
        this.createForm.title,
        this.objectSchema?.title || this.createForm.modelType,
        _subtype
      )
      this.emitSchemas()
    },
    // Load a form schema, if its model type is existing in the database, the wizard is done, else the object schema has to get imported.
    async doImport1(schema: IVeoFormSchema) {
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
          this.emitSchemas()
        }
      } else {
        this.state = 'import-2'
      }
    },
    // Load a form schema, if its model type is existing in the database, the wizard is done, else the object schema has to get imported.
    doImport2(schema: IVeoObjectSchema) {
      if (schema.title.toLowerCase() !== this.formSchema?.modelType) {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          text: this.$t('wrongobjectschema', {
            objectType: schema.title,
            formType: this.formSchema?.modelType
          })
        })
      } else {
        this.setObjectSchema(schema)
        this.emitSchemas()
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
    setFormSchema(schema: IVeoFormSchema) {
      this.fscode = JSON.stringify(schema, undefined, 2)
      this.formSchema = schema
    },
    emitSchemas() {
      this.$emit('update-form-schema', this.formSchema)
      this.$emit('update-object-schema', this.objectSchema)
      this.$emit('update-translation', this.translation)
    },
    onClose() {
      this.$router.push('/editor')
      return true
    }
  }
})
</script>

<i18n>
{
  "en": {
    "createFormSchema": "Create form schema",
    "createFormSchemaDescription": "Create a new form schema",
    "forceOwnSchema": "Don't load existing object schemas from the server",
    "format": "(.json)",
    "importFormSchema": "Import form schema",
    "importFormSchemaDescription": "Import an existing form schema and modify it.",
    "importFormSchemaHelp": "Upload the form schema you want to edit.",
    "importObjectSchemaHelp": "Upload the object schema the form schema is based on.",
    "importObjectschema": "Import object schema",
    "wrongobjectschema":
      "The uploaded object schema has the wrong type ({objectType}). It has to have the type ({formType}).",
    "formSchemaUploadLabel": "Form schema upload @:format",
    "objectSchemaUploadLabel": "Object schema upload @:format",
    "customObjectSchema": "Custom",
    "invalidObjectSchema": "Form schema doesn't match object schema",
    "invalidObjectSchemaHint":
      "It seems like the form schema is using properties not present on the remote object schema. Please upload the modified object schema.",
    "objectSchemaRequired": "You have to specify an object schema!",
    "start": "How do you want to start?"
  },
  "de": {
    "createFormSchema": "Formschema erstellen",
    "createFormSchemaDescription": "Neues Formschema erstellen",
    "forceOwnSchema": "Existierendes Objektschema selbst hochladen.",
    "format": "(.json)",
    "importFormSchema": "Formschema importieren",
    "importFormSchemaDescription": "Existierendes Formschema importieren und modifizieren",
    "importFormSchemaHelp": "Laden Sie hier das Formschema hoch, das Sie Bearbeiten möchten.",
    "importObjectSchemaHelp": "Laden Sie hier das Objektschema hoch, auf dem das Formschema basiert.",
    "importObjectschema": "Objektschema importieren",
    "wrongobjectschema":
      "Das hochgeladene Objektschema hat den falschen Typ ({objectType}). Der Typ muss \"{formType}\" sein.",
    "formSchemaUploadLabel": "Formschema hochladen @:format",
    "objectSchemaUploadLabel": "Objektschema hochladen @:format",
    "customObjectSchema": "Eigenes",
    "invalidObjectSchema": "Formschema stimmt nicht mit existierendem Objektschema überein",
    "invalidObjectSchemaHint":
      "Das Formschema verwendet Eigenschaften, die nicht im in der Anwendung hinterlegten Objektschema existieren. Bitte laden Sie das modifizierte Objektschema hoch.",
    "objectSchemaRequired": "Sie müssen ein Objektschema angeben",
    "start": "Wie möchten Sie starten?"
  }
}
</i18n>

<style lang="scss" scoped>
.v-list-item__subtitle {
  white-space: pre-wrap;
}
</style>
