<template>
  <VeoPageWrapper>
    <template #default>
      <VeoPage
        v-if="formSchema"
        sticky-header
        absolute-size
        :fullsize="previewCollapsed"
        no-padding
        :cols="12"
        :md="backlogCollapsed ? 6 : 8"
        :xl="backlogCollapsed ? 6 : 8"
        :title="$t('editor.formschema.headline')"
        page-class="d-flex flex-column"
        content-class="veo-formschema-editor-page"
      >
        <template #title>
          <a
            ref="downloadButton"
            href="#"
            class="text-decoration-none"
            style="vertical-align: bottom;"
            @click="downloadSchema()"
          >
            <v-btn icon large color="primary">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </a>
          <v-btn icon large color="primary" @click="showCodeEditor = true">
            <v-icon>mdi-code-tags</v-icon>
          </v-btn>
          <v-btn
            v-if="schemaIsValid.warnings.length > 0"
            icon
            large
            color="warning"
            class="ml-2"
            @click="showErrorDialog = !showErrorDialog"
          >
            <v-icon>mdi-alert-circle-outline</v-icon>
          </v-btn>
          <div v-if="!$vuetify.breakpoint.xs" class="veo-collapse-editor pa-1">
            <v-btn icon x-small @click="previewCollapsed = !previewCollapsed">
              <v-icon v-if="previewCollapsed">mdi-chevron-left</v-icon>
              <v-icon v-else>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
          <v-row v-if="schemaIsValid.valid" no-gutters class="flex-column overflow-hidden mt-2" style="width: 100%;">
            <v-col>
              <v-row class="mx-4">
                <v-col cols="2" class="pl-0">
                  <v-text-field
                    v-model="formSchema.modelType"
                    dense
                    hide-details
                    flat
                    readonly
                    disabled
                    :label="$t('editor.objectschema.objectschema')"
                    class="objectschema-type-field"
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="formSchema.name"
                    dense
                    hide-details
                    flat
                    :label="$t('editor.formschema.formschema')"
                    @input="updateSchemaName()"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </template>
        <template #default>
          <FormSchemaEditor
            v-if="!$fetchState.pending"
            v-model="formSchema"
            :object-schema="objectSchema"
            :backlog-collapsed="backlogCollapsed"
            @toggle-backlog="backlogCollapsed = !backlogCollapsed"
          />
          <v-row v-else class="fill-height flex-column text-center align-center px-8">
            <v-col cols="auto" style="flex-grow: 0">
              <v-icon style="font-size: 8rem; opacity: 0.5;" color="primary">mdi-information-outline</v-icon>
            </v-col>
            <v-col cols="auto" class="text-left">
              <h3>{{ $t('editor.objectschema.validation.schema.invalid') }}</h3>
              <v-list-item v-for="(error, index) of schemaIsValid.errors" :key="`e_${index}`" link>
                <v-list-item-content>
                  <v-list-item-title>{{ error.code }} </v-list-item-title>
                  <v-list-item-subtitle>{{ error.message }} </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-spacer />
          </v-row>
        </template>
      </VeoPage>
      <VeoPage
        v-if="formSchema && objectSchema && !previewCollapsed && !$vuetify.breakpoint.xs"
        absolute-size
        :cols="12"
        :md="backlogCollapsed ? 6 : 4"
        :xl="backlogCollapsed ? 6 : 4"
        height="100%"
        border-left
      >
        <v-card class="pa-3" style="height: 100%" outlined>
          <VeoForm
            v-model="objectData"
            :schema="objectSchema"
            :ui="formSchema.content"
            :lang="lang"
            :api="dynamicAPI"
          />
        </v-card>
      </VeoPage>
    </template>
    <template #helpers>
      <VEOFSEWizardDialog v-model="showCreationDialog" @object-schema="setObjectSchema" @form-schema="setFormSchema" />
      <VeoEditorErrorDialog v-model="showErrorDialog" :validation="schemaIsValid" />
      <VeoFSECodeEditorDialog v-model="showCodeEditor" :code="code" />
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import { IVEOFormSchema } from 'veo-formschema'
import { VEOObjectSchemaRAW } from 'veo-objectschema-7'
import Vue from 'vue'

import VEOFSEWizardDialog from '~/components/dialogs/SchemaEditors/VEOFSEWizardDialog.vue'
import VeoFSECodeEditorDialog from '~/components/dialogs/SchemaEditors/VeoFSECodeEditorDialog.vue'
import VeoForm from '~/components/forms/VeoForm.vue'
import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'
import VeoPage from '~/components/layout/VeoPage.vue'
import VeoEditorErrorDialog from '~/components/dialogs/SchemaEditors/VeoEditorErrorDialog.vue'
import { generateSchema, validate } from '~/lib/FormSchemaHelper'
import { VeoSchemaValidatorValidationResult } from '~/lib/VeoSchemaValidator'

export default Vue.extend({
  components: {
    VeoEditorErrorDialog,
    VeoPageWrapper,
    VeoPage,
    VeoForm,
    VEOFSEWizardDialog,
    VeoFSECodeEditorDialog
  },
  data() {
    return {
      previewCollapsed: false as boolean,
      backlogCollapsed: false as boolean,
      showCreationDialog: false as boolean,
      showErrorDialog: false as boolean,
      objectSchema: undefined as VEOObjectSchemaRAW | undefined,
      formSchema: undefined as IVEOFormSchema | undefined,
      lang: {},
      objectData: {},
      showCodeEditor: false as boolean
    }
  },
  async fetch() {
    const objectSchema = await this.$api.schema.fetch('process')
    if (this.$route.query.nowizard) {
      this.objectSchema = objectSchema
    }
  },
  head(): any {
    return {
      title: this.$t('editor.formschema.headline')
    }
  },
  computed: {
    code: {
      get(): string {
        return this.formSchema ? JSON.stringify(this.formSchema, undefined, 2) : ''
      },
      set(v: string) {
        try {
          this.formSchema = JSON.parse(v)
        } catch (e) {}
      }
    },
    dynamicAPI(): any {
      // TODO: need a solution if new target type is added
      return {
        fetchAll: (_objectType: string, _searchParams?: any) => {
          return new Promise((resolve: any) => {
            return resolve([])
          })
        }
      }
    },
    schemaIsValid(): VeoSchemaValidatorValidationResult {
      return this.formSchema ? validate(this.formSchema) : { valid: false, errors: [], warnings: [] }
    }
  },
  mounted() {
    if (this.$route.query.nowizard) {
      this.formSchema = generateSchema('Verarbeitungstätigkeiten', 'Process')
    }
    this.showCreationDialog = this.objectSchema === undefined && this.formSchema === undefined
  },
  methods: {
    updateSchema(formSchema: any) {
      this.formSchema = JSON.parse(JSON.stringify(formSchema))
    },
    setFormSchema(schema: IVEOFormSchema) {
      this.formSchema = schema
      this.showCreationDialog = !this.objectSchema || false
    },
    setObjectSchema(schema: VEOObjectSchemaRAW) {
      this.objectSchema = schema
      this.showCreationDialog = !this.formSchema || false
    },
    updateSchemaName() {
      if (this.formSchema) {
        this.formSchema.name = this.formSchema.name.toLowerCase()
      }
    },
    downloadSchema() {
      if (this.$refs.downloadButton) {
        const data: string = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.formSchema))}`
        ;(this.$refs.downloadButton as any).href = data
        ;(this.$refs.downloadButton as any).download = `fs_${this.formSchema?.name || 'download'}.json`
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-collapse-editor {
  background-color: rgb(245, 245, 245);
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  position: absolute;
  right: 0;
  top: 0;
}

::v-deep {
  .veo-formschema-editor-page {
    max-height: 100%;
  }
}

.objectschema-type-field ::v-deep label {
  color: rgba(0, 0, 0, 0.6) !important;
}

.objectschema-type-field ::v-deep input {
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>
