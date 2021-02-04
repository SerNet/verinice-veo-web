<template>
  <VeoPageWrapper :title="title" title-class="d-flex align-center">
    <template v-if="schemaIsValid.valid" #header>
      <v-tooltip top>
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
      <v-tooltip top>
        <template #activator="{on}">
          <v-btn icon large color="primary" @click="showCodeEditor = true" v-on="on">
            <v-icon>mdi-code-tags</v-icon>
          </v-btn>
        </template>
        <template #default>
          {{ $t('editor.schema.code') }}
        </template>
      </v-tooltip>
      <v-tooltip top>
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
      <v-spacer />
      <v-tooltip top>
        <template #activator="{on}">
          <v-btn icon large color="primary" class="mr-4" @click="showDetailDialog = !showDetailDialog" v-on="on">
            <v-icon>mdi-wrench</v-icon>
          </v-btn>
        </template>
        <template #default>
          {{ $t('editor.schema.properties') }}
        </template>
      </v-tooltip>
    </template>
    <template v-if="formSchema && objectSchema && schemaIsValid.valid" #default>
      <VeoPage
        v-if="!backlogCollapsed"
        absolute-size
        no-padding
        :cols="12"
        :md="oneColumnCollapsed ? 6 : 4"
        :xl="oneColumnCollapsed ? 6 : 4"
        sticky-header
      >
        <template #header>
          <h3 class="text-center pb-1">{{ $t('editor.formschema.controls.available') }}</h3>
          <v-text-field
            v-model="searchQuery"
            class="mb-1"
            dense
            flat
            clearable
            hide-details
            solo-inverted
            prepend-inner-icon="mdi-magnify"
            :label="$t('editor.formschema.search')"
          />
        </template>
        <template #default>
          <FormSchemaEditorBacklog
            :object-schema="objectSchema"
            :form-schema="formSchema"
            :search-query="searchQuery"
          />
        </template>
      </VeoPage>
      <v-divider vertical />
      <VeoPage
        absolute-size
        no-padding
        :cols="12"
        :md="oneColumnCollapsed ? 6 : 4"
        :xl="oneColumnCollapsed ? 6 : 4"
        sticky-header
        content-class="pb-4 px-4"
      >
        <template #header>
          <h3 class="text-center pb-1">{{ $t('editor.formschema.controls.current') }}</h3>
          <CollapseButton v-if="!$vuetify.breakpoint.xs" v-model="backlogCollapsed" />
          <CollapseButton v-if="!$vuetify.breakpoint.xs" v-model="previewCollapsed" right />
        </template>
        <template #default>
          <div class="fill-height fill-width d-flex px-2">
            <FseGenerator :schema="objectSchema" :value="formSchema.content" @delete="onDelete" @update="onUpdate" />
          </div>
        </template>
      </VeoPage>
      <v-divider vertical />
      <VeoPage
        v-if="!previewCollapsed && !$vuetify.breakpoint.xs"
        no-padding
        absolute-size
        :cols="12"
        :md="oneColumnCollapsed ? 6 : 4"
        :xl="oneColumnCollapsed ? 6 : 4"
        height="100%"
        content-class="pb-4 px-4"
      >
        <template #header>
          <h3 class="text-center pb-1">{{ $t('editor.formschema.preview') }}</h3>
        </template>
        <template #default>
          <v-card style="height: 100%" outlined>
            <VeoForm
              v-model="objectData"
              :schema="objectSchema"
              :ui="formSchema.content"
              :lang="lang"
              :api="dynamicAPI"
            />
          </v-card>
        </template>
      </VeoPage>
    </template>
    <template v-else-if="!schemaIsValid.valid" #default>
      <VeoPage
        v-if="formSchema"
        sticky-header
        absolute-size
        fullsize
        no-padding
        :cols="12"
        :title="title"
        content-class="px-4"
      >
        <template #default>
          <v-row class="fill-height flex-column text-center align-center px-8">
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
    </template>
    <template #helpers>
      <VEOFSEWizardDialog v-model="showCreationDialog" @object-schema="setObjectSchema" @form-schema="setFormSchema" />
      <VeoEditorErrorDialog v-model="showErrorDialog" :validation="schemaIsValid" />
      <VeoFSECodeEditorDialog v-model="showCodeEditor" :code="code" />
      <VeoFSESchemaDetailsDialog
        v-if="formSchema"
        v-model="showDetailDialog"
        :object-schema="formSchema.modelType"
        :form-schema="formSchema.name"
        :subtype="formSchema.subType"
        @update-schema-name="updateSchemaName"
        @update-subtype="updateSubType"
      />
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import { IVEOFormSchema } from 'veo-formschema'
import { VEOObjectSchemaRAW } from 'veo-objectschema-7'
import Vue from 'vue'
import vjp from 'vue-json-pointer'

import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'
import VeoPage from '~/components/layout/VeoPage.vue'
import CollapseButton from '~/components/layout/CollapseButton.vue'
import FseGenerator from '~/components/editor/FormSchema/Generator/FseGenerator.vue'
import FormSchemaEditorBacklog from '~/components/editor/FormSchema/FormSchemaEditorBacklog.vue'
import VeoForm from '~/components/forms/VeoForm.vue'
import VeoEditorErrorDialog from '~/components/dialogs/SchemaEditors/VeoEditorErrorDialog.vue'
import VeoFSECodeEditorDialog from '~/components/dialogs/SchemaEditors/VeoFSECodeEditorDialog.vue'
import VeoFSESchemaDetailsDialog from '~/components/dialogs/SchemaEditors/VeoFSESchemaDetailsDialog.vue'
import VEOFSEWizardDialog from '~/components/dialogs/SchemaEditors/VEOFSEWizardDialog.vue'

import { validate } from '~/lib/FormSchemaHelper'
import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator'

export default Vue.extend({
  components: {
    VeoPageWrapper,
    VeoPage,
    CollapseButton,
    FseGenerator,
    FormSchemaEditorBacklog,
    VeoForm,
    VeoEditorErrorDialog,
    VeoFSECodeEditorDialog,
    VeoFSESchemaDetailsDialog,
    VEOFSEWizardDialog
  },
  data() {
    return {
      previewCollapsed: false as boolean,
      backlogCollapsed: false as boolean,
      showCreationDialog: false as boolean,
      showErrorDialog: false as boolean,
      showDetailDialog: false as boolean,
      objectSchema: undefined as VEOObjectSchemaRAW | undefined,
      formSchema: undefined as IVEOFormSchema | undefined,
      showCodeEditor: false as boolean,
      objectData: {},
      lang: {},
      searchQuery: undefined as string | undefined
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
    schemaIsValid(): VeoSchemaValidatorValidationResult {
      return this.formSchema ? validate(this.formSchema, this.objectSchema) : { valid: false, errors: [], warnings: [] }
    },
    title(): string {
      return `${this.$t('editor.formschema.headline')} ${this.formSchema ? `(${this.formSchema?.name})` : ''}`
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
    oneColumnCollapsed(): boolean {
      return this.backlogCollapsed || this.previewCollapsed
    }
  },
  mounted() {
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
    updateSchemaName(value: string) {
      if (this.formSchema) {
        this.formSchema.name = value.toLowerCase()
      }
    },
    updateSubType(value: string) {
      if (this.formSchema) {
        this.formSchema.subType = value
      }
    },
    downloadSchema() {
      if (this.$refs.downloadButton) {
        const data: string = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.formSchema))}`
        ;(this.$refs.downloadButton as any).href = data
        ;(this.$refs.downloadButton as any).download = `fs_${this.formSchema?.name || 'download'}.json`
      }
    },
    onDelete(_event: any): void {
      if (this.formSchema) {
        vjp.remove(this.formSchema, '/content')
      }
    },
    onUpdate(event: any): void {
      if (this.formSchema) {
        const element = vjp.get(this.formSchema, `/content${event.formSchemaPointer}`)
        element.options = event.payload.options
        element.scope = event.payload.scope
        if (element.scope !== event.payload.scope) {
          // TODO: Implement
          /* vjp.set(this.value, event.payload.scope, element)
          vjp.remove(this.value, element.scope) */
        }
      }
    }
  }
})
</script>

<style lang="scss" scoped></style>
