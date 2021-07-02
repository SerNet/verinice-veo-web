<template>
  <VeoPageWrapper
    :title="title"
    title-class="d-flex align-center"
  >
    <template
      v-if="formSchema && objectSchema"
      #header
    >
      <v-tooltip bottom>
        <template #activator="{ on }">
          <a
            ref="downloadButton"
            href="#"
            class="text-decoration-none"
            style="vertical-align: bottom"
            @click="downloadSchema()"
            v-on="on"
          >
            <v-btn
              icon
              large
              color="primary"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </a>
        </template>
        <template #default>
          {{ $t("editor.schema.download") }}
        </template>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            icon
            large
            color="primary"
            @click="showCodeEditor = true"
            v-on="on"
          >
            <v-icon>mdi-code-tags</v-icon>
          </v-btn>
        </template>
        <template #default>
          {{ $t("formSchemaCode") }}
        </template>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            v-if="!schemaIsValid.valid"
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
          {{ $t("editor.schema.warnings") }}
        </template>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            icon
            large
            color="primary"
            @click="onClickTranslationBtn"
            v-on="on"
          >
            <v-icon>mdi-translate</v-icon>
          </v-btn>
        </template>
        <template #default>
          {{ $t("editor.formschema.translation") }}
        </template>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            icon
            large
            color="primary"
            @click="showDetailDialog = !showDetailDialog"
            v-on="on"
          >
            <v-icon>mdi-wrench</v-icon>
          </v-btn>
        </template>
        <template #default>
          {{ $t("editor.schema.properties") }}
        </template>
      </v-tooltip>
    </template>
    <template
      v-if="formSchema && objectSchema"
      #default
    >
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
          <h3 class="text-center pb-1">
            {{ $t("availableControls") }}
          </h3>
          <v-text-field
            v-model="searchQuery"
            class="mb-1"
            dense
            flat
            clearable
            hide-details
            solo-inverted
            prepend-inner-icon="mdi-magnify"
            :label="$t('search')"
          />
        </template>
        <template #default>
          <VeoFseBacklog
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
          <h3 class="text-center pb-1">
            {{ $t("usedControls") }}
          </h3>
          <VeoCollapseButton
            v-if="!$vuetify.breakpoint.xs"
            v-model="backlogCollapsed"
          />
          <VeoCollapseButton
            v-if="!$vuetify.breakpoint.xs"
            v-model="previewCollapsed"
            right
          />
        </template>
        <template
          v-if="schemaIsValid.valid"
          #default
        >
          <div class="fill-height fill-width d-flex px-2">
            <VeoFseGenerator
              :schema="objectSchema"
              :value="formSchema.content"
              :general-translation="translation && translation.lang[language]"
              :custom-translation="formSchema.translation[language]"
              @delete="onDelete"
              @update="onUpdate"
              @update-custom-translation="onUpdateCustomTranslation"
            />
          </div>
        </template>
        <template v-else>
          <v-row class="fill-height flex-column text-center align-center px-8">
            <v-col
              cols="auto"
              style="flex-grow: 0"
            >
              <v-icon
                style="font-size: 8rem; opacity: 0.5"
                color="primary"
              >
                mdi-information-outline
              </v-icon>
            </v-col>
            <v-col
              cols="auto"
              class="text-left"
            >
              <h3>{{ $t("invalidFormSchema") }}</h3>
            </v-col>
          </v-row>
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
          <h3 class="text-center pb-1">
            {{ $t("preview") }}
          </h3>
        </template>
        <template
          v-if="schemaIsValid.valid"
          #default
        >
          <v-card
            style="height: 100%"
            flat
          >
            <VeoForm
              v-model="objectData"
              :schema="objectSchema"
              :ui="formSchema.content"
              :general-translation="translation && translation.lang[language]"
              :custom-translation="formSchema.translation && formSchema.translation[language]"
              :api="dynamicAPI"
            />
          </v-card>
        </template>
        <template v-else>
          <v-row class="fill-height flex-column text-center align-center px-8">
            <v-col
              cols="auto"
              style="flex-grow: 0"
            >
              <v-icon
                style="font-size: 8rem; opacity: 0.5"
                color="primary"
              >
                mdi-information-outline
              </v-icon>
            </v-col>
            <v-col
              cols="auto"
              class="text-left"
            >
              <h3>{{ $t("invalidFormSchema") }}</h3>
            </v-col>
          </v-row>
        </template>
      </VeoPage>
    </template>
    <template #helpers>
      <VeoFseWizardDialog
        v-model="showCreationDialog"
        @update-object-schema="setObjectSchema"
        @update-form-schema="setFormSchema"
        @update-translation="setTranslation"
      />
      <VeoEditorErrorDialog
        v-model="showErrorDialog"
        :validation="schemaIsValid"
        @fix="onFixRequest"
      />
      <VeoFseCodeEditorDialog
        v-model="showCodeEditor"
        :code="code"
      />
      <VeoFseInvalidSchemaDownloadDialog
        v-model="invalidSchemaDownloadDialogVisible"
        @download="downloadSchema(true)"
      />
      <!-- Important: showTranslationDialog should be in v-if to only run code in the dialog when it is open  -->
      <VeoFseTranslationDialog
        v-if="!$fetchState.pending && showTranslationDialog && formSchema && formSchema.translation"
        v-model="showTranslationDialog"
        :translation="formSchema.translation"
        :language="language"
        :languages="avaliableLanguages"
        :name="formSchema.name"
        @update-language="setFormLanguage"
        @update-translation="setFormTranslation"
        @update-name="setFormName"
      />
      <VeoFseSchemaDetailsDialog
        v-if="formSchema"
        v-model="showDetailDialog"
        :object-schema="formSchema.modelType"
        :form-schema="formSchema.name[language]"
        :subtype="formSchema.subType"
        @update-schema-name="updateSchemaName"
        @update-subtype="updateSubType"
      />
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import vjp from 'vue-json-pointer';

import { computed, defineComponent, onMounted, provide, Ref, ref, useFetch, watch } from '@nuxtjs/composition-api';
import { JsonPointer } from 'json-ptr';
import { snakeCase } from 'lodash';
import { validate, deleteElementCustomTranslation } from '~/lib/FormSchemaHelper';
import {
  IVeoTranslations,
  IVeoObjectSchema,
  IVeoFormSchema,
  IVeoFormSchemaItemDeleteEvent,
  IVeoFormSchemaItem,
  IVeoFormSchemaItemUpdateEvent,
  IVeoFormSchemaTranslationCollection,
  IVeoFormSchemaCustomTranslationEvent,
  IVeoFormSchemaMeta
} from '~/types/VeoTypes';
import { IBaseObject } from '~/lib/utils';

interface IProps {}

export default defineComponent<IProps>({
  setup(_props, context) {
    /**
     * Layout specific stuff
     */
    const previewCollapsed = ref(false);
    const backlogCollapsed = ref(false);
    const showCreationDialog = ref(false);
    const showErrorDialog = ref(false);
    const showDetailDialog = ref(false);
    const showCodeEditor = ref(false);
    const searchQuery: Ref<undefined | string> = ref(undefined);

    const controlItems = ref({});

    const downloadButton: Ref<any> = ref(null);
    provide('controlsItems', controlItems);

    onMounted(() => {
      showCreationDialog.value = objectSchema.value === undefined && formSchema.value === undefined;
    });

    const title = computed(() => {
      const headline = context.root.$t('editor.formschema.headline');
      // Name property must generally exist, but before it is created in Wizard, only headline should be visible
      // If Name property exists and e.g. 'de' sub-property is empty then missing translation should be visible
      if (formSchema.value?.name) {
        const formSchemaName = formSchema.value?.name[language.value] ?? `Missing translation for ${language.value.toUpperCase()}`;
        return headline + ` - ${formSchemaName}`;
      } else {
        return headline;
      }
    });

    const oneColumnCollapsed = computed(() => backlogCollapsed.value || previewCollapsed.value);

    /**
     * Schema related stuff
     */
    const objectSchema: Ref<IVeoObjectSchema | undefined> = ref(undefined);
    const formSchema: Ref<IVeoFormSchema | undefined> = ref(undefined);
    provide('mainObjectSchema', objectSchema);
    provide('mainFormSchema', formSchema);
    const translation: Ref<IVeoTranslations | undefined> = ref(undefined);
    const objectData = ref({});
    const language = ref(context.root.$i18n.locale);

    watch(
      () => context.root.$i18n.locale,
      (newLanguageVal) => {
        language.value = newLanguageVal;
      }
    );

    const schemaIsValid = computed(() => (formSchema.value ? validate(formSchema.value, objectSchema.value) : { valid: false, errors: [], warnings: [] }));

    const dynamicAPI = computed(() => {
      return {
        fetchAll: (_objectType: string, _searchParams?: any) => {
          return new Promise((resolve: any) => {
            return resolve({ items: [], page: 1, pageCount: 0, totalItemCount: 0 });
          });
        }
      };
    });

    const code = computed(() => (formSchema.value ? JSON.stringify(formSchema.value, undefined, 2) : ''));

    function updateSchema(formSchema: any) {
      formSchema.value = JSON.parse(JSON.stringify(formSchema));
    }

    function setFormSchema(schema: IVeoFormSchema) {
      formSchema.value = schema;
      // If a translation for current app language does not exist, initialise it
      if (!formSchema.value.translation?.[context.root.$i18n.locale]) {
        setFormTranslation({
          ...formSchema.value.translation,
          ...{ [context.root.$i18n.locale]: {} }
        });
      }
      showCreationDialog.value = !objectSchema.value || false;
    }

    function setObjectSchema(schema: IVeoObjectSchema) {
      objectSchema.value = schema;
      showCreationDialog.value = !formSchema.value || false;
    }

    function setTranslation(newTranslation: IVeoTranslations) {
      translation.value = newTranslation;
    }

    function updateSchemaName(value: string) {
      if (formSchema.value) {
        vjp.set(formSchema.value, `/name/${language.value}`, value);
      }
    }

    function updateSubType(value: string) {
      if (formSchema.value) {
        formSchema.value.subType = value;
      }
    }

    const invalidSchemaDownloadDialogVisible = ref(false);
    function downloadSchema(forceDownload: boolean = false) {
      if (schemaIsValid.value.valid === false && !forceDownload) {
        invalidSchemaDownloadDialogVisible.value = true;
      } else if (downloadButton.value && downloadButton.value !== null) {
        invalidSchemaDownloadDialogVisible.value = false;
        const data: string = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(formSchema.value, undefined, 2))}`;
        downloadButton.value.href = data;
        downloadButton.value.download = snakeCase(`fs_${formSchema.value?.name[language.value] || 'download'}`) + '.json';
      }
    }

    function onDelete(event: IVeoFormSchemaItemDeleteEvent): void {
      if (formSchema.value) {
        // Delete custom translation keys for deleted elemented and nested elements
        const elementFormSchema = JsonPointer.get(formSchema.value.content, event.formSchemaPointer) as IVeoFormSchemaItem;
        deleteElementCustomTranslation(elementFormSchema, formSchema.value.translation[language.value], (updatedCustomTranslationValue) => {
          onUpdateCustomTranslation(updatedCustomTranslationValue);
        });
        const vjpPointer = event.formSchemaPointer.replace('#', '');
        // Not allowed to make changes on the root object
        if (event.formSchemaPointer !== '#') {
          vjp.remove(formSchema.value.content, vjpPointer);
        } else {
          vjp.remove(formSchema.value, '/content');
        }
      }
    }

    function onUpdate(event: IVeoFormSchemaItemUpdateEvent): void {
      if (formSchema.value?.content) {
        vjp.set(formSchema.value.content, event.formSchemaPointer.replace('#', ''), event.data);
      }
    }

    // TODO: during the refactoring process, look if controlItems here and in Backlog can be removed
    function updateControlItems(items: any) {
      controlItems.value = items;
    }

    /**
     * Translations related stuff
     */
    const showTranslationDialog: Ref<boolean> = ref(false);
    const avaliableLanguages: Ref<string[]> = ref([]);

    function onClickTranslationBtn() {
      showTranslationDialog.value = true;
    }

    useFetch(async () => {
      avaliableLanguages.value = Object.keys((await context.root.$api.translation.fetch([]))?.lang);
    });

    function setFormTranslation(event: IVeoFormSchemaTranslationCollection) {
      if (formSchema.value) {
        vjp.set(formSchema.value, '/translation', event);
      }
    }

    function setFormName(event: IVeoFormSchemaMeta['name']) {
      if (formSchema.value) {
        vjp.set(formSchema.value, '/name', event);
      }
    }

    function setFormLanguage(newLanguageVal: string) {
      language.value = newLanguageVal;
    }

    function onUpdateCustomTranslation(event: IVeoFormSchemaCustomTranslationEvent) {
      if (formSchema.value) {
        vjp.set(formSchema.value, `/translation/${language.value}`, event);
      }
    }

    function onFixRequest(code: string, params?: IBaseObject) {
      if (code === 'E_PROPERTY_MISSING' && params) {
        onDelete(params as any);
      }
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
      language,
      translation,
      schemaIsValid,
      dynamicAPI,
      updateSchema,
      setFormSchema,
      setObjectSchema,
      setTranslation,
      updateSchemaName,
      updateSubType,
      downloadSchema,
      onDelete,
      onUpdate,
      updateControlItems,
      invalidSchemaDownloadDialogVisible,
      downloadButton,
      code,
      showTranslationDialog,
      onClickTranslationBtn,
      avaliableLanguages,
      setFormTranslation,
      setFormName,
      setFormLanguage,
      onUpdateCustomTranslation,
      onFixRequest
    };
  },
  head(): any {
    return {
      title: this.$t('editor.formschema.headline')
    };
  }
});
</script>

<i18n>
{
  "en": {
    "availableControls": "Available controls",
    "usedControls": "Currently used controls",
    "preview": "Preview",
    "formSchemaCode": "Schema code",
    "invalidFormSchema":
      "Couldn't load schema. Please resolve the following errors and try again.",
    "search": "Search for a control..."
  },
  "de": {
    "availableControls": "Verfügbare Steuerelemente",
    "usedControls": "Verwendete Steuerelemente",
    "preview": "Vorschau",
    "formSchemaCode": "Schema code",
    "invalidFormSchema":
      "Das Schema konnte nicht geladen werden. Bitte beheben Sie die Fehler und versuchen Sie es erneut.",
    "search": "Nach einem Steuerelement suchen"
  }
}
</i18n>

<style lang="scss" scoped></style>
