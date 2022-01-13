<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Samuel Vitzthum
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
    :headline="$t('editor.objectschema.headline')"
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
          <h2>
            {{ $t('start') }}
          </h2>
          <v-list
            two-line
            class="px-0 overflow-hidden"
          >
            <v-list-item @click="state = 'create'">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ $t('createObjectSchema') }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ $t('createObjectSchemaDescription') }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon x-large>
                  mdi-chevron-right
                </v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-list-item @click="state = 'import'">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ $t('importObjectSchema') }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ $t('importObjectSchemaDescription') }}</v-list-item-subtitle>
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
          <v-form
            v-model="createForm.valid"
            @submit.prevent="createSchema()"
          >
            <h2>{{ $t('createObjectSchema') }}</h2>
            <v-row
              no-gutters
              class="align-center mt-4"
            >
              <v-col
                cols="12"
                :md="5"
              >
                <span style="font-size: 1.2rem;"> {{ $t('type') }}*: </span>
              </v-col>
              <v-col
                cols="12"
                :md="5"
              >
                <v-text-field
                  v-model="createForm.type"
                  :label="$t('type')"
                  :rules="createForm.rules.type"
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
                <span style="font-size: 1.2rem;"> {{ $t('description') }}*: </span>
              </v-col>
              <v-col
                cols="12"
                :md="5"
              >
                <v-text-field
                  v-model="createForm.description"
                  :label="$t('description')"
                  :rules="createForm.rules.description"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
          <small>{{ $t('global.input.requiredfields') }}</small>
        </v-window-item>
        <v-window-item
          value="import"
          class="px-4"
        >
          <h2>{{ $t('importObjectSchema') }}</h2>
          <v-row
            no-gutters
            class="align-center mt-4"
          >
            <v-col
              cols="12"
              :md="5"
            >
              <span style="font-size: 1.2rem;"> {{ $t('type') }}*: </span>
            </v-col>
            <v-col
              cols="12"
              :md="5"
            >
              <v-select
                v-model="modelType"
                :label="$t('type')"
                :items="objectTypes"
                required
              />
            </v-col>
          </v-row>
          <v-row v-if="modelType === 'custom'">
            <v-col cols="12">
              <VeoEditorFileUpload
                :code="code"
                :input-label="$t('uploadLabel')"
                @schema-uploaded="importSchema"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <span
                style="text-decoration: undeline; font-weight: bold; cursor: pointer;"
                @click="state = 'create'"
              >
                {{ $t('importObjectSchemaSwitch') }}
              </span>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </template>
    <template #dialog-options>
      <span />
      <v-btn
        v-if="state !== 'start'"
        text
        @click="state = 'start'"
      >
        {{ $t('global.button.previous') }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="state === 'create'"
        color="primary"
        text
        role="submit"
        type="submit"
        :disabled="!createForm.valid"
        @click="createSchema()"
      >
        {{ $t('global.button.next') }}
      </v-btn>
      <v-btn
        v-if="state === 'import' && modelType !== 'custom'"
        color="primary"
        text
        role="submit"
        type="submit"
        :disabled="importNextDisabled"
        @click="importSchema()"
      >
        {{ $t('global.button.next') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { capitalize, isEmpty, isEqual, isString, trim } from 'lodash';

import { IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IBaseObject, separateUUIDParam } from '~/lib/utils';

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
      modelType: '',
      code: '\n\n\n\n\n' as string,
      objectTypes: [] as { value: string; text: string }[]
    };
  },
  computed: {
    importNextDisabled(): boolean {
      return (this.modelType === 'custom' && this.code === '\n\n\n\n\n') || this.modelType === '';
    },
    isNavigatedByDialog() {
      return isEmpty(this.$route.query);
    },
    isDialogCustom() {
      return this.$route.query?.os === 'custom';
    },
    isDialogOpen(): boolean {
      return this.isNavigatedByDialog || this.isDialogCustom;
    },
    domainId(): string {
      return separateUUIDParam(this.$route.params.domain).id;
    }
  },
  watch: {
    dialog(newValue: boolean) {
      if (newValue) {
        this.state = 'import';
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
    state: {
      immediate: true,
      handler() {
        if (this.state === 'import' || this.state === 'start') {
          // Only load types of schema types if a user navigates by the dialog
          if ((this.isNavigatedByDialog || this.isDialogCustom) && this.objectTypes.length === 0) {
            this.$api.schema
              .fetchAll(true)
              .then((data) =>
                data.map((value: IVeoSchemaEndpoint) => {
                  return {
                    text: capitalize(value.schemaName),
                    value: value.schemaName
                  };
                })
              )
              .then((types: any) => {
                types.unshift({
                  text: this.$t('customObjectSchema') as string,
                  value: 'custom'
                });
                this.objectTypes = types;
              });
          }
        }
      }
    },
    $route: {
      immediate: true,
      deep: true,
      handler() {
        // If the user navigates by URL, depending on the parameters, schemas should be generated
        if (!this.isNavigatedByDialog || this.isDialogCustom) {
          if (isString(this.$route.query.type) && isString(this.$route.query.description)) {
            // If a user navigates through a URL which has parameters type and description, new OS should be created
            this.createForm.type = this.$route.query.type;
            this.createForm.description = this.$route.query.description;
            this.createSchema();
          } else if (this.$route.query.os === 'custom') {
            // If a user navigates through a URL which has custom os parameter,
            // the dialog with selected custom OS should be opened
            this.state = 'import';
            this.modelType = 'custom';
          } else if (isString(this.$route.query.os) && this.$route.query.os !== 'custom') {
            // If a user navigates through a URL which has os parameter different from 'custom'
            // (e.g. 'process', 'asset', etc.), the OS should be automatically loaded from the server
            this.state = 'import';
            this.modelType = this.$route.query.os;
            this.importSchema();
          }
        } else if (isEmpty(this.$route.query)) {
          this.state = 'start';
          this.code = '';
          this.modelType = '';
          this.clearCreateForm();
          this.$emit('completed', {});
        }
      }
    }
  },
  mounted() {
    this.dialog = this.value;
  },
  methods: {
    createSchema() {
      this.$emit('completed', {
        schema: undefined,
        meta: { type: this.createForm.type, description: this.createForm.description }
      });
      this.navigateTo({
        type: this.createForm.type,
        description: this.createForm.description
      });
    },
    importSchema(schema?: any) {
      if (schema) {
        this.$emit('completed', { schema, meta: undefined });
        this.navigateTo({ os: 'custom' });
      } else {
        this.$api.schema.fetch(this.modelType, [this.domainId]).then((data: any) => {
          this.$emit('completed', { schema: data, meta: undefined });
          this.navigateTo({ os: this.modelType });
        });
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
      };
    },
    onClose() {
      this.$router.push({
        name: 'unit-domains-domain-editor'
      });
      return true;
    },
    navigateTo(params: IBaseObject) {
      // If the current path does not match with new url, only then change the URL
      if (!isEqual(this.$route.query, params)) {
        this.$router.push({
          name: 'unit-domains-domain-editor-objectschema',
          query: params
        });
      }
    }
  }
});
</script>

<i18n>
{
  "en": {
    "createObjectSchema": "Create object schema",
    "createObjectSchemaDescription": "Create a new object schema from scratch.",
    "format": "(.json)",
    "importObjectSchema": "Import object schema",
    "importObjectSchemaSwitch": "Create a new object schema instead",
    "importObjectSchemaDescription": "Import an existing object schema and modify it.",
    "uploadLabel": "Object schema upload @:format",
    "customObjectSchema": "Custom",
    "start": "How do you want to start?",
    "description": "Description",
    "type": "Type of the object schema"
  },
  "de": {
    "createObjectSchema": "Objektschema erstellen",
    "createObjectSchemaDescription": "Neues, leeres Objektschema erstellen",
    "format": "(.json)",
    "importObjectSchema": "Objektschema importieren",
    "importObjectSchemaDescription": "Bestehendes Objektschema importieren und modifizieren",
    "importObjectSchemaSwitch": "Stattdessen ein neues Objektschema erstellen",
    "uploadLabel": "Objektschema hochladen @:format",
    "customObjectSchema": "Eigenes",
    "start": "Wie möchten Sie starten?",
    "description": "Beschreibung",
    "type": "Typ des Objektschemas"
  }
}
</i18n>

<style lang="scss" scoped>
.v-list-item__subtitle {
  white-space: pre-wrap;
}
</style>
