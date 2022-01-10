<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <VeoPageWrapper
    :title="title"
    title-class="d-flex align-center"
    collapsable-left
    collapsable-right
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
          {{ t("editor.schema.download") }}
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
          {{ t("formSchemaCode") }}
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
          {{ t("editor.schema.warnings") }}
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
          {{ t("editor.formschema.translation") }}
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
          {{ t("editor.schema.properties") }}
        </template>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{on}">
          <v-btn
            icon
            large
            target="_blank"
            to="/help"
            class="help-button"
            color="primary"
            v-on="on"
          >
            <v-icon>mdi-help-circle-outline</v-icon>
          </v-btn>
        </template>
        <template #default>
          {{ t('help') }}
        </template>
      </v-tooltip>
    </template>
    <template
      v-if="formSchema && objectSchema"
      #default
    >
      <VeoPage sticky-header>
        <template #header>
          <h3 class="text-center pb-1">
            {{ t("availableControls") }}
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
            :label="t('search')"
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
      <VeoPage
        heading-level="3"
        :title="t('usedControls')"
        :titlebar-alignment="VeoPageHeaderAlignment.CENTER"
      >
        <template
          v-if="schemaIsValid.valid"
          #default
        >
          <div class="fill-height fill-width d-flex">
            <VeoFseGenerator
              :schema="objectSchema"
              :value="formSchema.content"
              :general-translation="translation && translation.lang[language]"
              :custom-translations="formSchema.translation"
              :language="language"
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
              <h3>{{ t("invalidFormSchema") }}</h3>
            </v-col>
          </v-row>
        </template>
      </VeoPage>
      <VeoPage
        v-if="!$vuetify.breakpoint.xs"
        height="100%"
        heading-level="3"
        :title="t('preview')"
        :titlebar-alignment="VeoPageHeaderAlignment.CENTER"
      >
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
              <h3>{{ t("invalidFormSchema") }}</h3>
            </v-col>
          </v-row>
        </template>
      </VeoPage>
    </template>
    <template #helpers>
      <VeoFseWizardDialog
        v-model="showCreationDialog"
        :domain-id="domainId"
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
        :object-schema="objectSchema"
        :form-schema="formSchema.name[language]"
        :subtype="formSchema.subType"
        :sorting="formSchema.sorting"
        :domain-id="domainId"
        @update-schema-name="updateSchemaName"
        @update-subtype="updateSubType"
        @update-sorting="updateSorting"
      />
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import vjp from 'vue-json-pointer';

import { computed, defineComponent, onMounted, provide, Ref, ref, useContext, useFetch, useRoute, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { JsonPointer } from 'json-ptr';
import { validate, deleteElementCustomTranslation } from '~/lib/FormSchemaHelper';
import {
  IVeoTranslations,
  IVeoObjectSchema,
  IVeoFormSchema,
  IVeoFormSchemaItemDeleteEvent,
  IVeoFormSchemaItem,
  IVeoFormSchemaItemUpdateEvent,
  IVeoFormSchemaTranslationCollection,
  IVeoFormSchemaMeta
} from '~/types/VeoTypes';
import { IBaseObject, separateUUIDParam } from '~/lib/utils';
import { VeoPageHeaderAlignment } from '~/components/layout/VeoPageHeader.vue';

interface IProps {}

export default defineComponent<IProps>({
  setup(_props) {
    const { t } = useI18n();
    const { $api, app } = useContext();
    const route = useRoute();

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    /**
     * Layout specific stuff
     */
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
      const headline = t('editor.formschema.headline');
      // Name property must generally exist, but before it is created in Wizard, only headline should be visible
      // If Name property exists and e.g. 'de' sub-property is empty then missing translation should be visible
      if (formSchema.value?.name) {
        const formSchemaName = formSchema.value?.name[language.value] ?? `Missing translation for ${language.value.toUpperCase()}`;
        return headline + ` - ${formSchemaName}`;
      } else {
        return headline;
      }
    });

    /**
     * Schema related stuff
     */
    const objectSchema: Ref<IVeoObjectSchema | undefined> = ref(undefined);
    const formSchema: Ref<IVeoFormSchema | undefined> = ref(undefined);
    provide('mainObjectSchema', objectSchema);
    provide('mainFormSchema', formSchema);
    const translation: Ref<IVeoTranslations | undefined> = ref(undefined);
    const objectData = ref({});
    const language = ref(app.i18n.locale);

    watch(
      () => app.i18n.locale,
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

    function setFormSchema(schema: IVeoFormSchema) {
      if (schema) {
        schema = JSON.parse(JSON.stringify(schema).replaceAll('{CURRENT_DOMAIN_ID}', domainId.value));
      }

      formSchema.value = schema;
      // If a translation for current app language does not exist, initialise it
      if (formSchema.value && !formSchema.value.translation?.[app.i18n.locale]) {
        setFormTranslation({
          ...formSchema.value.translation,
          ...{ [app.i18n.locale]: {} }
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

    function updateSorting(value: string) {
      if (formSchema.value) {
        formSchema.value.sorting = value;
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
        downloadButton.value.download = `fs_${formSchema.value?.name[language.value] || 'missing_translation'}.json`;
      }
    }

    function onDelete(event: IVeoFormSchemaItemDeleteEvent): void {
      if (formSchema.value) {
        // Delete custom translation keys for deleted elemented and nested elements
        const elementFormSchema = JsonPointer.get(formSchema.value.content, event.formSchemaPointer) as IVeoFormSchemaItem;
        deleteElementCustomTranslation(elementFormSchema, formSchema.value.translation, onUpdateCustomTranslation);
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
      // TODO: Backend should create an API endpoint to get available languages dynamically
      avaliableLanguages.value = Object.keys((await $api.translation.fetch([]))?.lang);
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

    function onUpdateCustomTranslation(event: IVeoFormSchemaTranslationCollection) {
      if (formSchema.value) {
        vjp.set(formSchema.value, `/translation`, event);
      }
    }

    function onFixRequest(code: string, params?: IBaseObject) {
      if (code === 'E_PROPERTY_MISSING' && params) {
        onDelete(params as any);
      }
    }

    return {
      domainId,
      showCreationDialog,
      showErrorDialog,
      showCodeEditor,
      showDetailDialog,
      searchQuery,
      title,
      objectSchema,
      formSchema,
      objectData,
      language,
      translation,
      schemaIsValid,
      dynamicAPI,
      setFormSchema,
      setObjectSchema,
      setTranslation,
      updateSchemaName,
      updateSubType,
      updateSorting,
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
      onFixRequest,
      VeoPageHeaderAlignment,

      t
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
    "search": "Search for a control...",
    "help": "Help"
  },
  "de": {
    "availableControls": "Verfügbare Steuerelemente",
    "usedControls": "Verwendete Steuerelemente",
    "preview": "Vorschau",
    "formSchemaCode": "Schema code",
    "invalidFormSchema":
      "Das Schema konnte nicht geladen werden. Bitte beheben Sie die Fehler und versuchen Sie es erneut.",
    "search": "Nach einem Steuerelement suchen",
    "help": "Hilfe"
  }
}
</i18n>

<style lang="scss" scoped></style>
