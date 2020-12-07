<template>
  <v-col
    class="pa-0 fill-height overflow-hidden"
    style="max-height: calc(100vh - 70px);"
    cols="12"
  >
    <v-row v-if="formSchema" class="fill-height ma-0">
      <v-col
        class="pa-0"
        :style="{ maxHeight }"
        style="overflow: auto"
        cols="12"
        lg="8"
      >
        <v-row dense class="align-center">
          <v-col cols="auto"><h1 class="ml-4 mt-2">{{ $t('editor.formschema.headline') }}</h1></v-col>
          <v-col cols="auto">
            <a ref="downloadButton" href="#" class="text-decoration-none" @click="downloadSchema()">
              <v-btn icon large color="primary">
                <v-icon>mdi-download</v-icon>
              </v-btn>
            </a>
          </v-col>
        </v-row>
        <v-row class="mx-4">
          <v-col cols="12" lg="4" class="pl-0"><v-text-field v-model="formSchema.name" dense hide-details flat :label="$t('editor.formschema.formschema')" @input="updateSchemaName()" /></v-col>
        </v-row>
        <FormSchemaEditor
          v-if="!$fetchState.pending"
          v-model="formSchema"
          :object-schema="objectSchema"
        />
      </v-col>
      <v-col
        class="pa-0 fill-height"
        :style="{ maxHeight }"
        style="overflow: auto;"
        cols="12"
        lg="4"
      >
        <v-tabs v-model="tab">
          <v-tabs-slider />

          <v-tab href="#tab-1">
            Code
          </v-tab>

          <v-tab href="#tab-2">
            Preview
          </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
          <v-tab-item value="tab-1">
            <v-card class="pa-3 ma-1" outlined>
              <CodeEditor v-model="code" @schema-updated="updateSchema" />
            </v-card>
          </v-tab-item>
          <v-tab-item value="tab-2">
            <v-card class="pa-3 ma-1" outlined>
              <VeoForm
                v-model="objectData"
                :schema="objectSchema"
                :ui="formSchema.content"
                :lang="lang"
                :api="dynamicAPI"
              />
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
    <VEOFSEWizardDialog v-model="showCreationDialog" @object-schema="setObjectSchema" @form-schema="setFormSchema" />
  </v-col>
</template>

<script lang="ts">
import { IVEOFormSchema } from 'veo-formschema'
import { VEOObjectSchemaRAW } from 'veo-objectschema-7'
import Vue from 'vue'

import VEOFSEWizardDialog from '~/components/dialogs/SchemaEditors/VEOFSEWizardDialog.vue'
import VeoForm from '~/components/forms/VeoForm.vue'
import { generateSchema } from '~/lib/FormSchemaHelper'

export default Vue.extend({
  components: {
    VeoForm,
    VEOFSEWizardDialog
  },
  data() {
    return {
      tab: 'form-schema',
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
    maxHeight(): string {
      return 'calc(100vh - ' + this.$vuetify.application.top + 'px)'
    },
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
    },
    dynamicAPI(): any {
      // TODO: need a solution if new target type is added
      return {
        fetchAll: (objectType: string, searchParams?: any) => {}
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
        const data: string = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.formSchema))}`;
        (this.$refs.downloadButton as any).href = data;
        (this.$refs.downloadButton as any).download = `fs_${this.formSchema?.name || 'download'}.json`
      }
    }
  }
})
</script>

<style lang="scss" scoped></style>
