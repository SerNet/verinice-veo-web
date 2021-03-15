<template>
  <VeoPageWrapper>
    <template #default>
      <VeoPage
        v-if="objectSchemaHelper"
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
          <v-tooltip bottom>
            <template #activator="{on}">
              <a
                ref="downloadButton"
                href="#"
                class="text-decoration-none"
                style="vertical-align: bottom;"
                @click="downloadSchema()"
                v-on="on"
              >
                <v-btn icon large color="primary">
                  <v-icon>mdi-download</v-icon>
                </v-btn>
              </a>
            </template>
            <template #default>
              {{ $t('editor.schema.download') }}
            </template>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn
                v-if="schemaIsValid.warnings.length > 0"
                icon
                large
                color="warning"
                class="ml-2"
                @click="showErrorDialog = !showErrorDialog"
                v-on="on"
              >
                <v-icon>mdi-alert-circle-outline</v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('editor.schema.warnings') }}
            </template>
          </v-tooltip>
          <CollapseButton v-if="!$vuetify.breakpoint.xs" v-model="collapsed" right />
          <v-row v-if="schemaIsValid.valid" no-gutters class="flex-column overflow-hidden mt-2 fill-width">
            <v-col>
              <v-row class="mx-4">
                <v-col cols="12" lg="4">
                  <v-text-field
                    :value="title"
                    dense
                    hide-details
                    flat
                    :label="$t('editor.objectschema.objectschema')"
                    @input="updateSchemaName"
                  />
                </v-col>
                <v-col cols="12" lg="8">
                  <v-text-field
                    :value="description"
                    dense
                    hide-details
                    :label="$t('editor.objectschema.create.description')"
                    @input="updateDescription"
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
            v-model="objectSchemaHelper"
            :search="search"
            :hide-empty-aspects="hideEmptyAspects"
            @schema-updated="updateCode"
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
        v-if="!collapsed && objectSchemaHelper && !$vuetify.breakpoint.xs"
        no-padding
        absolute-size
        :cols="12"
        :md="6"
        :xl="6"
        height="100%"
        content-class="ose__code-editor"
      >
        <SchemaCodeEditor v-model="code" @schema-updated="updateSchema" />
      </VeoPage>
    </template>
    <template #helpers>
      <VEOOSEWizardDialog v-model="showCreationDialog" @completed="setSchema" />
      <VeoEditorErrorDialog v-model="showErrorDialog" :validation="schemaIsValid" />
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import Vue from 'vue'

import CollapseButton from '~/components/layout/CollapseButton.vue'
import VEOOSEWizardDialog from '~/components/dialogs/SchemaEditors/VEOOSEWizardDialog.vue'
import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'
import VeoPage from '~/components/layout/VeoPage.vue'
import VeoEditorErrorDialog from '~/components/dialogs/SchemaEditors/VeoEditorErrorDialog.vue'
import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator'
import ObjectSchemaHelper from '~/lib/ObjectSchemaHelper2'
import { IVeoObjectSchema } from '~/types/VeoTypes'

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
      hideEmptyAspects: false as boolean,
      search: '' as string,
      objectSchemaHelper: undefined as ObjectSchemaHelper | undefined,
      code: '' as string,
      schemaIsValid: { valid: false, errors: [], warnings: [] } as VeoSchemaValidatorValidationResult
    }
  },
  head(): any {
    return {
      title: this.$t('editor.objectschema.headline')
    }
  },
  computed: {
    title(): string {
      return this.objectSchemaHelper?.getTitle() || ''
    },
    description(): string {
      return this.objectSchemaHelper?.getDescription() || ''
    }
  },
  mounted() {
    this.showCreationDialog = true
  },
  methods: {
    setSchema(data: { schema?: IVeoObjectSchema; meta: { type: string; description: string } }) {
      this.showCreationDialog = false
      this.objectSchemaHelper = new ObjectSchemaHelper(data.schema)

      if (data.meta) {
        this.objectSchemaHelper.setTitle(data.meta.type)
        this.objectSchemaHelper.setDescription(data.meta.description)
      }
      this.code = JSON.stringify(this.objectSchemaHelper.toSchema(), undefined, 2)
      this.validate()
    },
    updateSchema(schema: IVeoObjectSchema) {
      this.objectSchemaHelper = new ObjectSchemaHelper(schema)
      this.code = JSON.stringify(this.objectSchemaHelper.toSchema(), undefined, 2)
      this.objectSchemaHelper = new ObjectSchemaHelper(JSON.parse(this.code))

      this.validate()
    },
    updateSchemaName(name: string) {
      this.objectSchemaHelper?.setTitle(name)
      this.code = JSON.stringify(this.objectSchemaHelper?.toSchema(), undefined, 2)
    },
    updateDescription(description: string) {
      this.objectSchemaHelper?.setDescription(description)
      this.code = JSON.stringify(this.objectSchemaHelper?.toSchema(), undefined, 2)
    },
    updateCode() {
      if (this.objectSchemaHelper) {
        this.code = JSON.stringify(this.objectSchemaHelper.toSchema(), undefined, 2)
        this.validate()
      }
    },
    downloadSchema() {
      if (this.$refs.downloadButton) {
        const data: string = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(this.objectSchemaHelper?.toSchema(), undefined, 2)
        )}`
        ;(this.$refs.downloadButton as any).href = data
        ;(this.$refs.downloadButton as any).download = `os_${this.objectSchemaHelper?.getTitle() || 'download'}.json`
      }
    },
    validate() {
      this.schemaIsValid = this.objectSchemaHelper?.validate() || { valid: false, errors: [], warnings: [] }
    }
  }
})
</script>
<style>
.ose__code-editor {
  height: 100%;
}
</style>