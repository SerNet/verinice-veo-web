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
            @click="codeEditorVisible = true"
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
            @click="errorDialogVisible = !errorDialogVisible"
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
            @click="detailDialogVisible = !detailDialogVisible"
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
            :to="HELP_ROUTE"
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
      <v-tooltip bottom>
        <template #activator="{on}">
          <div v-on="on">
            <v-btn
              icon
              large
              color="primary"
              :disabled="ability.cannot('manage', 'editors')"
              @click="save"
            >
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </div>
        </template>
        <template #default>
          <span v-if="ability.can('manage', 'editors')">{{ t('save') }}</span>
          <span v-else>{{ t('saveContentCreator') }}</span>
        </template>
      </v-tooltip>
    </template>
    <template
      v-if="formSchema && objectSchema"
      #default
    >
      <VeoPage
        sticky-header
      >
        <template #header>
          <h3 class="text-h3 text-center pb-1">
            {{ t("availableControls") }}
          </h3>
          <v-text-field
            v-model="searchQuery"
            class="mb-1"
            dense
            flat
            clearable
            hide-details
            filled
            prepend-inner-icon="mdi-magnify"
            :label="t('search')"
          />
        </template>
        <template #default>
          <VeoFseBacklog
            :object-schema="objectSchema"
            :form-schema="formSchema"
            :search-query="searchQuery"
            @control-items="updateControlItems"
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
              @update-custom-translation="setFormTranslation"
            />
          </div>
        </template>
        <template
          v-else
          #default
        >
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
              <span class="text-h3">
                {{ t("invalidFormSchema") }}
              </span>
            </v-col>
          </v-row>
        </template>
      </VeoPage>
      <VeoPage
        v-if="!vuetify.breakpoint.xs"
        height="100%"
        heading-level="3"
        :title="t('preview')"
        :titlebar-alignment="VeoPageHeaderAlignment.CENTER"
      >
        <template
          v-if="schemaIsValid.valid"
          #default
        >
          <VeoForm
            v-model="objectData"
            :object-schema="objectSchema"
            :form-schema="formSchema.content"
            :translations="translations"
            :additional-context="additionalContext"
            :locale="language"
          />
        </template>
        <template
          v-else
          #default
        >
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
              <span class="text-h3">
                {{ t("invalidFormSchema") }}
              </span>
            </v-col>
          </v-row>
        </template>
      </VeoPage>
    </template>
    <template #helpers>
      <VeoFseWizardDialog
        :value="creationDialogVisible"
        :domain-id="domainId"
        @done="onWizardFinished"
      />
      <VeoEditorErrorDialog
        v-model="errorDialogVisible"
        :validation="schemaIsValid"
        @fix="onFixRequest"
      />
      <VeoFseCodeEditorDialog
        v-model="codeEditorVisible"
        :code="code"
      />
      <VeoFseInvalidSchemaDownloadDialog
        v-model="invalidSchemaDownloadDialogVisible"
        @download="downloadSchema(true)"
      />
      <!-- Important: translationDialogVisible should be in v-if to only run code in the dialog when it is open  -->
      <VeoFseTranslationDialog
        v-if="!$fetchState.pending && translationDialogVisible && formSchema && formSchema.translation"
        v-model="translationDialogVisible"
        v-model:current-display-language="language"
        :translations="formSchema.translation"
        :available-languages="availableLanguages"
        :name="formSchema.name"
        @update-translation="setFormTranslation"
        @update-name="setFormName"
      />
      <VeoFseSchemaDetailsDialog
        v-if="formSchema"
        v-model="detailDialogVisible"
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

import { Ref } from 'vue';
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
import { useVeoAlerts } from '~/composables/VeoAlert';
import { ROUTE as HELP_ROUTE } from '~/pages/help/index.vue';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useCreateForm, useUpdateForm } from '~/composables/api/forms';
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';
import { useFetchDomain } from '~~/composables/api/domains';

export default defineComponent({
  setup() {
    const { locale, t } = useI18n();
    const { i18n, vuetify } = useNuxtApp();
    const route = useRoute();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { ability } = useVeoPermissions();

    const domainId = computed(() => separateUUIDParam(route.params.domain as string).id);

    /**
     * Layout specific stuff
     */
    const creationDialogVisible = computed(() => !objectSchema.value || !formSchema.value);
    const errorDialogVisible = ref(false);
    const detailDialogVisible = ref(false);
    const codeEditorVisible = ref(false);
    const searchQuery: Ref<undefined | string> = ref(undefined);

    const controlItems = ref({});

    const downloadButton: Ref<any> = ref(null);
    provide('controlsItems', controlItems);

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
    const language = ref(locale.value);

    watch(
      () => locale.value,
      (newLanguageVal) => {
        language.value = newLanguageVal;
      }
    );

    const schemaIsValid = computed(() => (formSchema.value ? validate(formSchema.value, objectSchema.value) : { valid: false, errors: [], warnings: [] }));

    const code = computed(() => (formSchema.value ? JSON.stringify(formSchema.value, undefined, 2) : ''));

    function setFormSchema(schema: IVeoFormSchema) {
      formSchema.value = schema;
      // If a translation for current app language does not exist, initialise it
      if (formSchema.value && !formSchema.value.translation?.[locale.value]) {
        setFormTranslation({
          ...formSchema.value.translation,
          ...{ [locale.value]: {} }
        });
      }
    }

    function setObjectSchema(schema: IVeoObjectSchema) {
      objectSchema.value = schema;
    }

    function setTranslation(newTranslation: IVeoTranslations) {
      translation.value = newTranslation;
    }

    const onWizardFinished = (payload: { formSchema: IVeoFormSchema; objectSchema: IVeoObjectSchema; translations: IVeoTranslations }) => {
      setTranslation(payload.translations);
      setObjectSchema(payload.objectSchema);
      setFormSchema(payload.formSchema);
    };

    // Create/update stuff
    const createFormSchemaQueryParameters = computed(() => ({
      domainId: domainId.value,
      form: formSchema.value as IVeoFormSchema
    }));
    const { mutateAsync: create } = useCreateForm({
      onSuccess: (data: any) => {
        if (formSchema.value) {
          formSchema.value.id = data; // For some reason the interface always returns void, even though this is a string
        }
      }
    });
    const updateFormSchemaQueryParameters = computed(() => ({
      id: formSchema.value?.id || '',
      domainId: domainId.value,
      form: formSchema.value as IVeoFormSchema
    }));
    const { mutateAsync: update } = useUpdateForm();

    async function save() {
      // control whether save new or save updated schema
      try {
        if (!formSchema.value) {
          throw new Error('Formschema not defined');
        }
        if (formSchema.value.id) {
          await update(updateFormSchemaQueryParameters);
        } else {
          await create(createFormSchemaQueryParameters);
        }
        displaySuccessMessage(t('saveSchemaSuccess').toString());
      } catch (err: any) {
        displayErrorMessage(t('error').toString(), `${t('saveSchemaError').toString()}: ${err.message}`);
      }
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
    function downloadSchema(forceDownload = false) {
      if (schemaIsValid.value.valid === false && !forceDownload) {
        invalidSchemaDownloadDialogVisible.value = true;
      } else if (downloadButton.value && downloadButton.value !== null) {
        invalidSchemaDownloadDialogVisible.value = false;
        const data = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(formSchema.value, undefined, 2))}`;
        downloadButton.value.href = data;
        downloadButton.value.download = `fs_${formSchema.value?.name[language.value] || 'missing_translation'}.json`;
      }
    }

    function onDelete(event: IVeoFormSchemaItemDeleteEvent): void {
      if (formSchema.value) {
        const pointer = event.formSchemaPointer as string;
        // Delete custom translation keys for deleted elemented and nested elements
        const elementFormSchema = JsonPointer.get(formSchema.value.content, pointer) as IVeoFormSchemaItem;
        deleteElementCustomTranslation(elementFormSchema, formSchema.value.translation, setFormTranslation);
        const vjpPointer = pointer.replace('#', '');
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
        vjp.set(formSchema.value.content, (event.formSchemaPointer as string).replace('#', ''), event.data);
      }
    }

    // TODO: during the refactoring process, look if controlItems here and in Backlog can be removed
    function updateControlItems(items: any) {
      controlItems.value = items;
    }

    const fetchDomainQueryParameters = computed(() => ({ id: domainId.value }));
    const { data: domain } = useFetchDomain(fetchDomainQueryParameters);

    /**
     * Translations related stuff
     */
    const translationDialogVisible: Ref<boolean> = ref(false);
    const availableLanguages = computed(() => (i18n.locales as LocaleObject[]).map((locale) => locale.code));

    function onClickTranslationBtn() {
      translationDialogVisible.value = true;
    }

    function setFormTranslation(event: IVeoFormSchemaTranslationCollection) {
      if (formSchema.value) {
        formSchema.value.translation = event;
      }
    }

    function setFormName(event: IVeoFormSchemaMeta['name']) {
      if (formSchema.value) {
        formSchema.value.name = event;
      }
    }

    function onFixRequest(code: string, params?: IBaseObject) {
      if (code === 'E_PROPERTY_MISSING' && params) {
        onDelete(params as any);
      }
    }

    // Circumventing {CURRENT_DOMAIN_ID} in fse controls
    const additionalContext = computed(() => ({
      [`#/properties/domains/properties/{CURRENT_DOMAIN_ID}/properties/riskValues/properties/DSRA/properties/implementationStatus`]: {
        formSchema: {
          enum: (() => (domain.value?.riskDefinitions?.DSRA?.implementationStateDefinition?.levels || []).map((level: any) => level.name))()
        }
      },
      [`#/properties/domains/properties/{CURRENT_DOMAIN_ID}/properties/riskValues/properties/DSRA/properties/potentialProbability`]: {
        formSchema: {
          enum: (() => (domain.value?.riskDefinitions?.DSRA?.probability?.levels || []).map((level: any) => level.name))()
        }
      },
      [`#/properties/domains/properties/{CURRENT_DOMAIN_ID}/properties/riskValues/properties/DSRA/properties/potentialImpacts/properties/C`]: {
        formSchema: {
          enum: (() => (domain.value?.riskDefinitions?.DSRA?.categories?.find((category) => category.id === 'C')?.potentialImpacts || []).map((level: any) => level.name))()
        }
      },
      [`#/properties/domains/properties/{CURRENT_DOMAIN_ID}/properties/riskValues/properties/DSRA/properties/potentialImpacts/properties/I`]: {
        formSchema: {
          enum: (() => (domain.value?.riskDefinitions?.DSRA?.categories?.find((category) => category.id === 'I')?.potentialImpacts || []).map((level: any) => level.name))()
        }
      },
      [`#/properties/domains/properties/{CURRENT_DOMAIN_ID}/properties/riskValues/properties/DSRA/properties/potentialImpacts/properties/A`]: {
        formSchema: {
          enum: (() => (domain.value?.riskDefinitions?.DSRA?.categories?.find((category) => category.id === 'A')?.potentialImpacts || []).map((level: any) => level.name))()
        }
      },
      [`#/properties/domains/properties/{CURRENT_DOMAIN_ID}/properties/riskValues/properties/DSRA/properties/potentialImpacts/properties/R`]: {
        formSchema: {
          enum: (() => (domain.value?.riskDefinitions?.DSRA?.categories?.find((category) => category.id === 'R')?.potentialImpacts || []).map((level: any) => level.name))()
        }
      }
    }));

    const translations = computed(() => {
      const toReturn: IBaseObject = {};
      const languages = Object.keys(translation.value?.lang || {});

      for (const language of languages) {
        toReturn[language] = { ...translation.value?.lang[language], ...(formSchema.value?.translation?.[language] || {}) };
      }

      return toReturn;
    });

    return {
      ability,
      additionalContext,
      creationDialogVisible,
      domainId,
      errorDialogVisible,
      codeEditorVisible,
      detailDialogVisible,
      searchQuery,
      title,
      objectSchema,
      formSchema,
      objectData,
      language,
      translation,
      schemaIsValid,
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
      translationDialogVisible,
      onClickTranslationBtn,
      availableLanguages,
      setFormTranslation,
      setFormName,
      onFixRequest,
      VeoPageHeaderAlignment,
      save,
      translations,
      onWizardFinished,
      vuetify,

      t,
      HELP_ROUTE
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
    "help": "Help",
    "save": "Save",
    "saveSchemaSuccess": "Schema saved! The change will be visible to other users in less than 30 minutes.",
    "saveSchemaError": "Couldn't save schema!",
    "error": "Error",
    "saveContentCreator": "You need the role \"Content Creator\" to save the formschema."
  },
  "de": {
    "availableControls": "Verfügbare Steuerelemente",
    "usedControls": "Verwendete Steuerelemente",
    "preview": "Vorschau",
    "formSchemaCode": "Schema code",
    "invalidFormSchema":
      "Das Schema konnte nicht geladen werden. Bitte beheben Sie die Fehler und versuchen Sie es erneut.",
    "search": "Nach einem Steuerelement suchen",
    "help": "Hilfe",
    "save": "Speichern",
    "saveSchemaSuccess": "Schema wurde gespeichert! Andere User werden die Änderung in spätestens 30 Minuten sehen.",
    "saveSchemaError": "Schema konnte nicht gespeichert werden",
    "error": "Fehler",
    "saveContentCreator": "Sie müssen die Rolle \"Content Creator\" besitzen, um das Formschema zu speichern."
  }
}
</i18n>

<style lang="scss" scoped></style>
