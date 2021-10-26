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
  <VeoDialog
    v-if="isDialogOpen"
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
        <v-window-item
          value="start"
          class="py-4"
        >
          <h2>{{ $t('start') }}</h2>
          <v-list
            two-line
            class="px-0 overflow-hidden"
          >
            <v-list-item @click="state = 'create'">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ $t('createFormSchema') }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ $t('createFormSchemaDescription') }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon x-large>
                  mdi-chevron-right
                </v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-list-item @click="state = 'import-fs'">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ $t('importFormSchema') }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ $t('importFormSchemaDescription') }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon x-large>
                  mdi-chevron-right
                </v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-window-item>
        <v-window-item
          value="create"
          class="px-4"
        >
          <h2>{{ $t('createFormSchema') }}</h2>
          <v-form
            v-model="createForm.valid"
            @submit.prevent="doCreate()"
          >
            <v-row
              no-gutters
              class="align-center mt-4"
            >
              <v-col
                cols="12"
                :md="5"
              >
                <span style="font-size: 1.2rem;">{{ $t('editor.formschema.create.title.text') }}*:</span>
              </v-col>
              <v-col
                cols="12"
                :md="5"
              >
                <v-text-field
                  v-model="createForm.title"
                  :label="$t('editor.formschema.create.title')"
                  :rules="createForm.rules.title"
                  required
                />
              </v-col>
            </v-row>
            <v-row
              no-gutters
              class="align-center mt-4"
            >
              <v-col
                cols="12"
                :md="5"
              >
                <span style="font-size: 1.2rem;">{{ $t('editor.formschema.subtype') }}:</span>
              </v-col>
              <v-col
                cols="12"
                :md="5"
              >
                <v-text-field
                  v-model="createForm.subType"
                  :label="$t('editor.formschema.subtype')"
                />
              </v-col>
            </v-row>
            <v-row
              no-gutters
              class="align-center mt-4"
            >
              <v-col
                cols="12"
                :md="5"
              >
                <span style="font-size: 1.2rem;">{{ $t('editor.formschema.sorting') }}:</span>
              </v-col>
              <v-col
                cols="12"
                :md="5"
              >
                <v-text-field
                  v-model="createForm.sorting"
                  :label="$t('editor.formschema.sorting')"
                />
              </v-col>
            </v-row>
            <v-row
              no-gutters
              class="align-center mt-4"
            >
              <v-col
                cols="12"
                :md="5"
              >
                <span style="font-size: 1.2rem;">{{ $t('editor.formschema.create.type.text') }}*:</span>
              </v-col>
              <v-col
                cols="12"
                :md="5"
              >
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
              <v-col cols="12">
                <VeoEditorFileUpload
                  :code="oscode"
                  :input-label="$t('objectSchemaUploadLabel')"
                  :submit-button-text="$t('importObjectschema')"
                  @schema-uploaded="setObjectSchema({ schema: $event })"
                />
              </v-col>
            </v-row>
          </v-form>
          <small>{{ $t('global.input.requiredfields') }}</small>
        </v-window-item>
        <v-window-item
          value="import-fs"
          class="px-4"
        >
          <h2>{{ $t('importFormSchema') }}</h2>
          <p>{{ $t('importFormSchemaHelp') }}</p>
          <VeoEditorFileUpload
            :code="fscode"
            :input-label="$t('formSchemaUploadLabel')"
            :clear-input.sync="clearInput"
            @schema-uploaded="doImportFs"
          />
          <v-checkbox
            v-model="forceOwnSchema"
            :label="$t('forceOwnSchema')"
          />
        </v-window-item>
        <v-window-item value="import-os">
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
          >
            <template #additional-button>
              <v-btn
                class="mt-2"
                outlined
                color="info"
                @click="emitSchemas"
              >
                {{ $t('proceedWithIncomaptibleSchema') }}
              </v-btn>
            </template>
          </VeoAlert>
          <VeoEditorFileUpload
            :code="oscode"
            :input-label="$t('objectSchemaUploadLabel')"
            @schema-uploaded="doImportOs"
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
      >
        {{ $t('global.button.previous') }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="state === 'create'"
        color="primary"
        role="submit"
        type="submit"
        text
        :disabled="!createForm.valid || (createForm.modelType === 'custom' && !objectSchema)"
        @click="doCreate()"
      >
        {{ $t('global.button.next') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { capitalize, cloneDeep, isEmpty, isString, merge, trim } from 'lodash';

import { JsonPointer } from 'json-ptr';
import { generateSchema, validate } from '~/lib/FormSchemaHelper';
import { VeoEvents } from '~/types/VeoGlobalEvents';
import { IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IVeoTranslations, IVeoObjectSchema, IVeoFormSchema, IVeoObjectSchemaTranslations } from '~/types/VeoTypes';

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
        sorting: null as string | null,
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
      state: 'start' as 'start' | 'create' | 'import-fs' | 'import-os',
      schemas: [] as IVeoSchemaEndpoint[],
      invalidOS: false as boolean,
      forceOwnSchema: false as boolean,
      clearInput: false as boolean,
      formSchemaId: undefined as string | undefined,
      urlToNavigate: undefined as string | undefined
    };
  },
  computed: {
    objectTypes(): { text: string; value: string }[] {
      return [
        {
          text: this.$t('customObjectSchema') as string,
          value: 'custom'
        },
        ...this.schemas.map((entry: IVeoSchemaEndpoint) => {
          return {
            text: capitalize(entry.schemaName),
            value: entry.schemaName
          };
        })
      ];
    },
    isNavigatedByDialog() {
      return isEmpty(this.$route.query);
    },
    isDialogCustom() {
      return this.$route.query.os === 'custom' || this.$route.query.fs === 'custom';
    },
    isDialogOpen(): boolean {
      return this.isNavigatedByDialog || this.isDialogCustom;
    }
  },
  watch: {
    dialog(newValue: boolean) {
      if (newValue) {
        // this.state = 'step1'
      }
      if (!this.noWatch) {
        this.$emit('input', newValue);
      }
    },
    value(newValue: boolean) {
      this.noWatch = true;
      this.dialog = newValue;
      this.noWatch = false;
    },
    async state(newValue) {
      if (newValue === 'create') {
        this.schemas = await this.$api.schema.fetchAll(true);
      }
    },
    $route: {
      immediate: true,
      deep: true,
      async handler() {
        if (isString(this.$route.query.sorting)) {
          this.createForm.sorting = this.$route.query.sorting;
        }
        if (isString(this.$route.query.name) && isString(this.$route.query.subtype)) {
          if (this.$route.query.os === 'custom') {
            this.state = 'create';
            this.createForm.title = this.$route.query.name;
            this.createForm.subType = this.$route.query.subtype;
            this.createForm.modelType = this.$route.query.os;
          } else if (isString(this.$route.query.os)) {
            this.createForm.title = this.$route.query.name;
            this.createForm.subType = this.$route.query.subtype;
            this.createForm.modelType = this.$route.query.os;
            await this.doCreate();
          }
        } else if (isString(this.$route.query.fs)) {
          if (this.$route.query.os === 'custom') {
            this.forceOwnSchema = true;
          }
          if (this.$route.query.fs === 'custom') {
            this.state = 'import-fs';
          } else {
            this.formSchemaId = this.$route.query.fs;
            if (this.$route.query.os === 'custom') {
              this.state = 'import-os';
            }
            await this.doImportFs();
          }
        } else if (isEmpty(this.$route.query)) {
          this.setStartState();
        }
      }
    }
  },
  mounted() {
    this.dialog = this.value;
  },
  methods: {
    goBack() {
      if (this.state === 'create' || this.state === 'import-fs') {
        this.setStartState();
      } else if (this.state === 'import-os') {
        this.fscode = '';
        this.oscode = '';
        this.clearInput = true;
        this.state = 'import-fs';
      }
    },
    // Create/load object schema and proceed to step 1
    async doCreate() {
      // Only proceed if an object schema was uploaded/pasted (we sadly can't validate it in the form, so we have to to it here)
      if (this.objectSchema || this.createForm.modelType !== 'custom') {
        if (this.createForm.modelType !== 'custom') {
          await this.setObjectSchema({ modelType: this.createForm.modelType });
        }
        this.generateInitialFs();
      } else {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          text: this.$t('objectSchemaRequired')
        });
      }
    },
    generateInitialFs() {
      const _subtype = !this.createForm.subType || trim(this.createForm.subType).length === 0 ? null : this.createForm.subType;
      const _sorting = !this.createForm.sorting || trim(this.createForm.sorting).length === 0 ? null : this.createForm.sorting;
      this.formSchema = generateSchema({ [this.$i18n.locale]: this.createForm.title }, this.objectSchema?.title || this.createForm.modelType, _subtype, _sorting);
      this.emitSchemas();
    },
    // Load a form schema, if its model type is existing in the database, the wizard is done, else the object schema has to get imported.
    async doImportFs(schema?: IVeoFormSchema) {
      // If schema is not given as parameter, it is probably
      if (!schema && this.formSchemaId) {
        schema = await this.$api.form.fetch(this.formSchemaId);
      }
      if (schema) {
        this.setFormSchema(schema);
        if (!this.forceOwnSchema) {
          await this.setObjectSchema({ modelType: schema.modelType?.toLowerCase() });

          /* Checks whether the form schema fits the object schema. If not, we assume that the object schema the
           * user used for this form schema is a modified version of an existing object schema and ask him to provide it.
           */
          if (!validate(schema, this.objectSchema).valid) {
            this.invalidOS = true;
            this.state = 'import-os';
          } else {
            this.emitSchemas();
          }
        } else {
          this.state = 'import-os';
        }
      }
    },
    // Load a form schema, if its model type is existing in the database, the wizard is done, else the object schema has to get imported.
    async doImportOs(schema: IVeoObjectSchema) {
      if (schema.title !== this.formSchema?.modelType) {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          text: this.$t('wrongobjectschema', {
            objectType: schema.title,
            formType: this.formSchema?.modelType
          })
        });
      } else {
        await this.setObjectSchema({ schema });
        this.emitSchemas();
      }
    },
    clearCreateForm() {
      this.createForm = {
        title: '' as string,
        modelType: '' as string,
        subType: null as string | null,
        sorting: null as string | null,
        valid: false,
        rules: {
          title: [(input: string) => trim(input).length > 0],
          modelType: [(input: string) => trim(input).length > 0]
        }
      };
    },
    setStartState() {
      this.state = 'start';
      this.oscode = '\n\n\n\n\n';
      this.objectSchema = undefined;
      this.fscode = '\n\n\n\n\n';
      this.formSchema = undefined;
      this.formSchemaId = undefined;
      this.translation = undefined;
      this.clearCreateForm();
      this.emitSchemas();
    },
    async setObjectSchema(params: { schema?: IVeoObjectSchema; modelType?: string }) {
      let urlToNavigate = '/editor/formschema';
      if (this.createForm.title && this.createForm.subType) {
        urlToNavigate = `${urlToNavigate}?name=${this.createForm.title}&subtype=${this.createForm.subType}&sorting=${this.createForm.sorting || ''}&os=`;
        urlToNavigate += this.createForm.modelType && this.createForm.modelType !== 'custom' ? this.createForm.modelType.toLowerCase() : 'custom';
      } else if (['import-fs', 'import-os'].includes(this.state)) {
        urlToNavigate = `${urlToNavigate}?fs=${this.formSchemaId ?? 'custom'}`;
        urlToNavigate += this.forceOwnSchema ? '&os=custom' : '';
      }
      this.urlToNavigate = urlToNavigate;

      const objectSchema = cloneDeep(params.schema) ?? (await this.$api.schema.fetch(params.modelType as string));
      // os specific translation within by user uploaded OS
      const osTranslation = cloneDeep(JsonPointer.get(objectSchema, '#/properties/translations') as IVeoObjectSchemaTranslations | undefined);
      // The variable mergedOsTranslation serves to merge general and OS specific translations uploaded by a user. Initial value is general translation object
      let mergedOsTranslation = cloneDeep(this.translation) ?? (await this.$api.translation.fetch([]));
      // If osTranslation exists merge general and OS specific translations
      if (osTranslation) {
        // Remove "translations" property from by user uploaded OS to avoid validation errors (it is not conform with JsonSchema standard)
        JsonPointer.unset(objectSchema, '#/properties/translations');
        if (mergedOsTranslation?.lang) {
          // If general translations exists, merge general with OS specific ones (general ones will be overwritten)
          mergedOsTranslation.lang = merge(mergedOsTranslation.lang, osTranslation);
        } else {
          // If general translations do not exists, translations will be the same as OS specific translations
          mergedOsTranslation = { lang: { ...osTranslation } };
        }
      }
      this.translation = mergedOsTranslation;
      this.oscode = JSON.stringify(objectSchema, undefined, 2);
      this.objectSchema = objectSchema;
    },
    setFormSchema(schema: IVeoFormSchema) {
      this.fscode = JSON.stringify(schema, undefined, 2);
      this.formSchema = schema;
    },
    emitSchemas() {
      // TODO: maybe emit dialog close value.
      this.$emit('update-form-schema', this.formSchema);
      this.$emit('update-object-schema', this.objectSchema);
      this.$emit('update-translation', this.translation);
      if (this.state !== 'start') {
        this.navigateTo();
      }
    },
    onClose() {
      this.$router.push('/editor');
      return true;
    },
    navigateTo() {
      // If the current path does not match with new url, only then change the URL
      if (this.urlToNavigate && this.$route.path !== this.urlToNavigate) {
        // history.pushState({}, '', this.urlToNavigate);
        this.$router.push(this.urlToNavigate);
      }
    }
  }
});
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
      "It seems like the form schema is using properties not present on the remote object schema. If this form schemaa is based on a modified object schema, please upload it below.",
    "objectSchemaRequired": "You have to specify an object schema!",
    "proceedWithIncomaptibleSchema": "Proceed",
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
      "Das Formschema verwendet Eigenschaften, die nicht im in der Anwendung hinterlegten Objektschema existieren. Falls es auf einem modifizierten Objektschema basiert, laden Sie dieses bitte hoch.",
    "objectSchemaRequired": "Sie müssen ein Objektschema angeben",
    "proceedWithIncomaptibleSchema": "Trotzdem weiter",
    "start": "Wie möchten Sie starten?"
  }
}
</i18n>

<style lang="scss" scoped>
.v-list-item__subtitle {
  white-space: pre-wrap;
}
</style>
