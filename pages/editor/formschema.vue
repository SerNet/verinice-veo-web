<template>
  <div style="width: 100%; height: 100%;">
    <v-row no-gutters style="height: 100%; flex-wrap: nowrap">
      <VeoPage
        v-if="formSchema"
        :cols="8"
        :xl="8"
        :title="$t('editor.formschema.headline')"
      >
        <template #title>
          <a
            ref="downloadButton"
            href="#"
            class="text-decoration-none"
            @click="downloadSchema()"
          >
            <v-btn icon large color="primary">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </a>
        </template>
        <template #default>
          <div
            class="d-flex flex-column"
            style="width: 100%; height: 100%; flex-wrap: nowrap; overflow: hidden;"
          >
            <v-col
              v-if="formSchema"
              cols="4"
              class="px-4"
              style="flex-basis: auto;"
            >
              <v-text-field
                v-model="formSchema.name"
                dense
                hide-details
                flat
                :label="$t('editor.formschema.formschema')"
                @input="updateSchemaName()"
              />
            </v-col>
            <FormSchemaEditor
              v-if="!$fetchState.pending"
              v-model="formSchema"
              :object-schema="objectSchema"
            />
          </div>
        </template>
      </VeoPage>
      <VeoPage v-if="formSchema && objectSchema" :cols="4">
        <VeoTabs fullsize>
          <template #tabs>
            <v-tab>Preview</v-tab>
            <v-tab>Code</v-tab>
          </template>
          <template #items>
            <v-tab-item>
              <v-card class="pa-3 ma-1" outlined>
                <VeoForm
                  v-model="objectData"
                  :schema="objectSchema"
                  :ui="formSchema.content"
                  :lang="lang"
                  :api="{}"
                />
              </v-card>
            </v-tab-item>
            <v-tab-item>
              <v-card class="pa-3 ma-1" outlined>
                <CodeEditor v-model="code" @schema-updated="updateSchema" />
              </v-card>
            </v-tab-item>
          </template>
        </VeoTabs>
      </VeoPage>
    </v-row>
    <VEOFSEWizardDialog
      v-model="showCreationDialog"
      @object-schema="setObjectSchema"
      @form-schema="setFormSchema"
    />
  </div>
</template>

<script lang="ts">
import { IVEOFormSchema } from 'veo-formschema'
import { VEOObjectSchemaRAW } from 'veo-objectschema-7'
import Vue from 'vue'

import VEOFSEWizardDialog from '~/components/dialogs/SchemaEditors/VEOFSEWizardDialog.vue'
import VeoForm from '~/components/forms/VeoForm.vue'
import VeoTabs from '~/components/layout/VeoTabs.vue'
import VeoPage from '~/components/layout/VeoPage.vue'
import { generateSchema } from '~/lib/FormSchemaHelper'

export default Vue.extend({
  components: {
    VeoForm,
    VEOFSEWizardDialog,
    VeoTabs
  },
  data() {
    return {
      showCreationDialog: false as boolean,
      objectSchema: undefined as VEOObjectSchemaRAW | undefined,
      formSchema: undefined as IVEOFormSchema | undefined,
      lang: {},
      objectData: {}
    }
  },
  async fetch() {
    const objectSchema = await this.$api.schema.fetch('process')
    if (!this.$route.query.wizard) {
      this.objectSchema = objectSchema
    }
  },
  computed: {
    code: {
      get(): string {
        return this.formSchema
          ? JSON.stringify(this.formSchema, undefined, 2)
          : ''
      },
      set(v: string) {
        try {
          this.formSchema = JSON.parse(v)
        } catch (e) {}
      }
    }
  },
  mounted() {
    if (!this.$route.query.wizard) {
      this.formSchema = generateSchema('Verarbeitungstätigkeiten', 'Process')
    }
    this.showCreationDialog =
      this.objectSchema === undefined && this.formSchema === undefined
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
        const data: string = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(this.formSchema)
        )}`
        ;(this.$refs.downloadButton as any).href = data
        ;(this.$refs.downloadButton as any).download = `fs_${this.formSchema
          ?.name || 'download'}.json`
      }
    }
  }
})
</script>

<style lang="scss" scoped></style>
