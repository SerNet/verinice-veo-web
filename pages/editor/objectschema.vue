<template>
  <div class="veo-page-wrapper">
    <VeoPage v-if="schema" :fullsize="collapsed" :cols="12" :md="collapsed ? 12 : 6" :xl="collapsed ? 12 : 6" :title="$t('editor.objectschema.headline')">
      <template #header>
        <a ref="downloadButton" href="#" class="text-decoration-none" @click="downloadSchema()">
          <v-btn icon large color="primary">
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </a>
        <div v-if="!$vuetify.breakpoint.xs" class="veo-collapse-editor pa-1">
          <v-btn icon @click="collapsed = !collapsed">
            <v-icon v-if="collapsed">mdi-chevron-left</v-icon>
            <v-icon v-else>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </template>
      <template #default>
        <v-col :cols="collapsed ? 8 : 12">
          <v-row no-gutters class="flex-column overflow-hidden">
            <v-col>
              <v-row class="mx-4">
                <v-col cols="12" lg="4"><v-text-field v-model="schema.title" dense hide-details flat :label="$t('editor.objectschema.objectschema')" @input="updateSchemaName()" /></v-col>
                <v-col cols="12" lg="8"><v-text-field v-model="schema.description" dense hide-details :label="$t('editor.objectschema.create.description')" /></v-col>
              </v-row>
            </v-col>
            <ObjectSchemaEditor v-model="schema" @schema-updated="updateSchema" />
          </v-row>
        </v-col>
      </template>
    </VeoPage>
    <VeoPage v-if="schema && !collapsed && !$vuetify.breakpoint.xs" :cols="12" :md="collapsed ? 12 : 6" :xl="collapsed ? 12 : 6" height="100%">
      <CodeEditor v-model="code" @schema-updated="updateSchema" />
    </VeoPage>
    <VEOOSEWizardDialog v-model="showCreationDialog" @schema="setSchema" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { VEOObjectSchemaRAW } from 'veo-objectschema-7'

import VEOOSEWizardDialog from '~/components/dialogs/SchemaEditors/VEOOSEWizardDialog.vue'
import VeoPage from '~/components/layout/VeoPage.vue'

export default Vue.extend({
  components: {
    VEOOSEWizardDialog,
    VeoPage
  },
  data() {
    return {
      collapsed: false as boolean,
      showCreationDialog: false as boolean,
      schema: undefined as VEOObjectSchemaRAW | undefined
    }
  },
  head(): any {
    return {
      title: this.$t('editor.objectschema.headline')
    }
  },
  computed: {
    maxHeight(): string {
      return 'calc(100vh - ' + this.$vuetify.application.top + 'px)'
    },
    code: {
      get(): string {
        return this.schema ? JSON.stringify(this.schema, undefined, 2) : ''
      },
      set(v: string) {
        try {
          this.schema = JSON.parse(v)
        } catch (e) {}
      }
    }
  },
  mounted() {
    this.showCreationDialog = this.schema === undefined
  },
  methods: {
    updateSchema(schema: VEOObjectSchemaRAW) {
      this.schema = undefined // We have to set schema to undefined first, else changes wouldn't get picked up.
      this.schema = schema
    },
    setSchema(schema: VEOObjectSchemaRAW) {
      this.schema = schema
      this.showCreationDialog = false
    },
    updateSchemaName() {
      if (this.schema) {
        this.schema.title = this.schema.title.toLowerCase()
      }
    },
    downloadSchema() {
      if (this.$refs.downloadButton) {
        const data: string = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.schema))}`;
        (this.$refs.downloadButton as any).href = data;
        (this.$refs.downloadButton as any).download = `os_${this.schema?.title || 'download'}.json`
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.veo-collapse-editor {
  background-color: rgb(245, 245, 245);
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  position: absolute;
  right: 0;
  top: 0;
}
</style>
