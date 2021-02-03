<template>
  <VeoPageWrapper>
    <template #default>
      <VeoPage
        v-if="schema"
        sticky-header
        absolute-size
        :fullsize="collapsed"
        no-padding
        :cols="12"
        :md="collapsed ? 12 : 6"
        :xl="collapsed ? 12 : 6"
        :title="$t('editor.objectschema.headline')"
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
          <CollapseButton v-if="!$vuetify.breakpoint.xs" v-model="collapsed" right />
          <v-row v-if="schemaIsValid.valid" no-gutters class="flex-column overflow-hidden mt-2 fill-width">
            <v-col>
              <v-row class="mx-4">
                <v-col cols="12" lg="4">
                  <v-text-field
                    :value="schema.title"
                    dense
                    hide-details
                    flat
                    :label="$t('editor.objectschema.objectschema')"
                    @input="updateSchemaName"
                  />
                </v-col>
                <v-col cols="12" lg="8">
                  <v-text-field
                    v-model="schema.description"
                    dense
                    hide-details
                    :label="$t('editor.objectschema.create.description')"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </template>
        <template #header>
          <v-row
            v-if="schemaIsValid.valid"
            dense
            class="flex-column"
            :style="{
              borderBottom: `1px solid ${$vuetify.theme.themes.light.grey}`
            }"
          >
            <v-col>
              <v-text-field
                v-model="search"
                dense
                clearable
                flat
                solo-inverted
                hide-details
                prepend-inner-icon="mdi-magnify"
                :label="$t('editor.search.label')"
              />
            </v-col>
            <v-col>
              <v-checkbox
                v-model="hideEmptyAspects"
                class="caption"
                dense
                hide-details
                :label="$t('editor.hideemptyaspects')"
              />
            </v-col>
          </v-row>
        </template>
        <template #default>
          <ObjectSchemaEditor
            v-if="schemaIsValid.valid"
            v-model="schema"
            :search="search"
            :hide-empty-aspects="hideEmptyAspects"
            @schema-updated="updateSchema"
          />
          <v-row v-else class="fill-height flex-column text-center align-center px-8">
            <v-col cols="auto" style="flex-grow: 0">
              <v-icon style="font-size: 8rem; opacity: 0.5;" color="primary">mdi-information-outline</v-icon>
            </v-col>
            <v-col cols="auto" class="text-left">
              <h3>{{ $t('editor.objectschema.validation.schema.invalid') }}</h3>
              <v-list-item v-for="(error, index) of schemaIsValid.errors" :key="`e_${index}`" link>
                <v-list-item-content>
                  <v-list-item-title>{{ error.code }}</v-list-item-title>
                  <v-list-item-subtitle>{{ error.message }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-spacer />
          </v-row>
        </template>
      </VeoPage>
      <v-divider vertical />
      <VeoPage
        v-if="schema && !collapsed && !$vuetify.breakpoint.xs"
        no-padding
        absolute-size
        :cols="12"
        :md="6"
        :xl="6"
        height="100%"
      >
        <CodeEditor v-model="code" @schema-updated="updateSchema" />
      </VeoPage>
    </template>
    <template #helpers>
      <VEOOSEWizardDialog v-model="showCreationDialog" @schema="setSchema" />
      <VeoEditorErrorDialog v-model="showErrorDialog" :validation="schemaIsValid" />
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import { VEOObjectSchemaRAW } from 'veo-objectschema-7'

import CollapseButton from '~/components/layout/CollapseButton.vue'
import VEOOSEWizardDialog from '~/components/dialogs/SchemaEditors/VEOOSEWizardDialog.vue'
import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'
import VeoPage from '~/components/layout/VeoPage.vue'
import VeoEditorErrorDialog from '~/components/dialogs/SchemaEditors/VeoEditorErrorDialog.vue'
import { renameSchema, validate } from '~/lib/ObjectSchemaHelper'
import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator'

export default Vue.extend({
  components: {
    VeoEditorErrorDialog,
    VEOOSEWizardDialog,
    CollapseButton,
    VeoPageWrapper,
    VeoPage
  },
  data() {
    return {
      collapsed: false as boolean,
      showCreationDialog: false as boolean,
      showErrorDialog: false as boolean,
      schema: undefined as VEOObjectSchemaRAW | undefined,
      hideEmptyAspects: false as boolean,
      search: '' as string
    }
  },
  head(): any {
    return {
      title: this.$t('editor.objectschema.headline')
    }
  },
  computed: {
    code: {
      get(): string {
        return this.schema ? JSON.stringify(this.schema, undefined, 2) : ''
      },
      set(v: string) {
        try {
          this.schema = JSON.parse(v)
        } catch (e) {}
      }
    },
    schemaIsValid(): VeoSchemaValidatorValidationResult {
      return this.schema ? validate(this.schema) : { valid: false, errors: [], warnings: [] }
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
    updateSchemaName(name: string) {
      if (this.schema) {
        renameSchema(this.schema, name.toLowerCase())
      }
    },
    downloadSchema() {
      if (this.$refs.downloadButton) {
        const data: string = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.schema))}`
        ;(this.$refs.downloadButton as any).href = data
        ;(this.$refs.downloadButton as any).download = `os_${this.schema?.title || 'download'}.json`
      }
    }
  }
})
</script>
