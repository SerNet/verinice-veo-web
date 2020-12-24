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
          <div v-if="!$vuetify.breakpoint.xs" class="veo-collapse-editor pa-1">
            <v-btn icon x-small @click="previewCollapsed = !previewCollapsed">
              <v-icon v-if="previewCollapsed">mdi-chevron-left</v-icon>
              <v-icon v-else>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
          <v-row no-gutters class="flex-column overflow-hidden mt-2" style="width: 100%;">
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
          <VeoForm v-model="objectData" :schema="objectSchema" :ui="formSchema.content" :lang="lang" :api="{}" />
        </v-card>
      </VeoPage>
    </template>
    <template #helpers>
      <VEOFSEWizardDialog v-model="showCreationDialog" @object-schema="setObjectSchema" @form-schema="setFormSchema" />
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
import { generateSchema } from '~/lib/FormSchemaHelper'

export default Vue.extend({
  components: {
    VeoForm,
    VEOFSEWizardDialog,
    VeoFSECodeEditorDialog
  },
  data() {
    return {
      previewCollapsed: false as boolean,
      backlogCollapsed: false as boolean,
      showCreationDialog: false as boolean,
      objectSchema: undefined as VEOObjectSchemaRAW | undefined,
      formSchema: undefined as IVEOFormSchema | undefined,
      lang: {},
      objectData: {},
      showCodeEditor: false as boolean
    }
  },
  async fetch() {
    const objectSchema = await this.$api.schema.fetch('process')
    if (!this.$route.query.wizard) {
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
    }
  },
  mounted() {
    if (!this.$route.query.wizard) {
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

.veo-fse-code-editor-page {
  border-left: 1px solid $grey;
}

.objectschema-type-field ::v-deep label {
  color: rgba(0, 0, 0, 0.6) !important;
}

.objectschema-type-field ::v-deep input {
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>
