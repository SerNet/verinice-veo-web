<template>
  <VeoPageWrapper :title="title" title-class="d-flex align-center">
    <template #header v-if="formSchema && objectSchema && schemaIsValid.valid">
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
          <v-btn icon large color="primary" @click="showCodeEditor = true" v-on="on">
            <v-icon>mdi-code-tags</v-icon>
          </v-btn>
        </template>
        <template #default>
          {{ $t('editor.schema.code') }}
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
      <v-tooltip bottom>
        <template #activator="{on}">
          <v-btn icon large color="primary" @click="onClickTranslationBtn" v-on="on">
            <v-icon>mdi-translate</v-icon>
          </v-btn>
        </template>
        <template #default>
          {{ $t('editor.formschema.translation') }}
        </template>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{on}">
          <v-btn icon large color="primary" @click="showDetailDialog = !showDetailDialog" v-on="on">
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
            @controlItems="updateControlItems"
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
      <VeoPage v-if="formSchema" sticky-header absolute-size fullsize no-padding :cols="12" content-class="px-4">
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
      <VEOFSETranslationDialog
        v-if="formSchema && formSchema.translation"
        v-model="showTranslationDialog"
        :translation.sync="formSchema.translation"
      />
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
import VEOFSETranslationDialog from '~/components/dialogs/SchemaEditors/VEOFSETranslationDialog.vue'

import { validate } from '~/lib/FormSchemaHelper'
import { computed, defineComponent, onMounted, provide, Ref, ref, useContext } from '@nuxtjs/composition-api'

interface IProps {}

export default defineComponent<IProps>({
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
    VEOFSEWizardDialog,
    VEOFSETranslationDialog
  },
  head(): any {
    return {
      title: this.$t('editor.formschema.headline')
    }
  },
  setup(_props, context) {
    /**
     * Layout specific stuff
     */
    const previewCollapsed = ref(false)
    const backlogCollapsed = ref(false)
    const showCreationDialog = ref(false)
    const showErrorDialog = ref(false)
    const showDetailDialog = ref(false)
    const showCodeEditor = ref(false)
    const searchQuery: Ref<undefined | string> = ref(undefined)

    const controlItems = ref({})

    const downloadButton: Ref<any> = ref(null)
    provide('controlsItems', controlItems)

    onMounted(() => {
      showCreationDialog.value = objectSchema.value === undefined && formSchema.value === undefined
    })

    const title = computed(
      () => context.root.$t('editor.formschema.headline') + (formSchema.value ? `- ${formSchema.value?.name}` : '')
    )

    const oneColumnCollapsed = computed(() => backlogCollapsed.value || previewCollapsed.value)

    /**
     * Schema related stuff
     */
    const objectSchema: Ref<VEOObjectSchemaRAW | undefined> = ref(undefined)
    const formSchema: Ref<any | undefined> = ref(undefined)
    const objectData = ref({})
    const lang = ref({})

    const schemaIsValid = computed(() =>
      formSchema.value ? validate(formSchema.value, objectSchema.value) : { valid: false, errors: [], warnings: [] }
    )

    const dynamicAPI = computed(() => {
      return {
        fetchAll: (_objectType: string, _searchParams?: any) => {
          return new Promise((resolve: any) => {
            return resolve([])
          })
        }
      }
    })

    const code = computed(() => (formSchema.value ? JSON.stringify(formSchema.value, undefined, 2) : ''))

    function updateSchema(formSchema: any) {
      formSchema.value = JSON.parse(JSON.stringify(formSchema))
    }

    function setFormSchema(schema: IVEOFormSchema) {
      formSchema.value = schema
      showCreationDialog.value = !objectSchema.value || false
    }

    function setObjectSchema(schema: VEOObjectSchemaRAW) {
      objectSchema.value = schema
      showCreationDialog.value = !formSchema.value || false
    }

    function updateSchemaName(value: string) {
      if (formSchema.value) {
        formSchema.value.name = value.toLowerCase()
      }
    }

    function updateSubType(value: string) {
      if (formSchema.value) {
        formSchema.value.subType = value
      }
    }

    function downloadSchema() {
      if (downloadButton.value && downloadButton.value !== null) {
        const data: string = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(formSchema.value))}`
        downloadButton.value.href = data
        downloadButton.value.download = `fs_${formSchema.value?.name || 'download'}.json`
      }
    }

    function onDelete(_event: any): void {
      if (formSchema.value) {
        vjp.remove(formSchema.value, '/content')
      }
    }

    function onUpdate(event: any): void {
      if (formSchema.value) {
        const element = vjp.get(formSchema.value, `/content${event.formSchemaPointer}`)
        element.options = event.payload.options
        element.scope = event.payload.scope
        if (element.scope !== event.payload.scope) {
          // TODO: Implement
          /* vjp.set(this.value, event.payload.scope, element)
          vjp.remove(this.value, element.scope) */
        }
      }
    }

    function updateControlItems(items: any) {
      controlItems.value = items
    }

    /**
     * Translations related stuff
     */
    const showTranslationDialog: Ref<boolean> = ref(false)

    function onClickTranslationBtn() {
      showTranslationDialog.value = true
    }

    return {
      previewCollapsed,
      backlogCollapsed,
      showCreationDialog,
      showErrorDialog,
      showCodeEditor,
      showDetailDialog,
      searchQuery,
      title,
      oneColumnCollapsed,
      objectSchema,
      formSchema,
      objectData,
      lang,
      schemaIsValid,
      dynamicAPI,
      updateSchema,
      setFormSchema,
      setObjectSchema,
      updateSchemaName,
      updateSubType,
      downloadSchema,
      onDelete,
      onUpdate,
      updateControlItems,
      downloadButton,
      code,
      showTranslationDialog,
      onClickTranslationBtn
    }
  }
})
</script>

<style lang="scss" scoped></style>
