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
  <LayoutPageWrapper
    :title="title"
    title-class="d-flex align-center"
    :collapsable-left="schemaIsValid.valid"
    :collapsable-right="schemaIsValid.valid"
  >
    <template
      v-if="formSchema && objectSchema"
      #header
    >
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <a
            v-bind="props"
            ref="downloadButton"
            href="#"
            class="text-decoration-none"
            style="vertical-align: bottom"
            @click="downloadSchema()"
          >
            <v-btn
              :icon="mdiDownload"
              size="large"
              variant="text"
              color="primary"
            />
          </a>
        </template>
        <template #default>
          {{ globalT("editor.schema.download") }}
        </template>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            :icon="mdiCodeTags"
            size="large"
            variant="text"
            color="primary"
            v-bind="props"
            @click="codeEditorVisible = true"
          />
        </template>
        <template #default>
          {{ t("formSchemaCode") }}
        </template>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-if="!schemaIsValid.valid"
            :icon="mdiAlertCircleOutline"
            size="large"
            variant="text"
            color="warning"
            class="ml-2"
            v-bind="props"
            @click="errorDialogVisible = !errorDialogVisible"
          />
        </template>
        <template #default>
          {{ globalT("editor.schema.warnings") }}
        </template>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            :icon="mdiTranslate"
            size="large"
            variant="text"
            color="primary"
            v-bind="props"
            @click="onClickTranslationBtn"
          />
        </template>
        <template #default>
          {{ globalT("editor.formschema.translation") }}
        </template>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            :icon="mdiWrench"
            size="large"
            variant="text"
            color="primary"
            v-bind="props"
            @click="detailDialogVisible = !detailDialogVisible"
          />
        </template>
        <template #default>
          {{ globalT("editor.schema.properties") }}
        </template>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            :icon="mdiHelpCircleOutline"
            size="large"
            variant="text"
            target="_blank"
            :to="HELP_ROUTE"
            class="help-button"
            color="primary"
            v-bind="props"
          />
        </template>
        <template #default>
          {{ t('help') }}
        </template>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <div v-bind="props">
            <v-btn
              :icon="mdiContentSave"
              size="large"
              variant="text"
              color="primary"
              :disabled="ability.cannot('manage', 'editors')"
              @click="save"
            />
          </div>
        </template>
        <template #default>
          <span v-if="ability.can('manage', 'editors')">{{ t('save') }}</span>
          <span v-else>{{ t('saveContentCreator') }}</span>
        </template>
      </v-tooltip>
    </template>
    <template
      v-if="formSchema && objectSchema && schemaIsValid.valid"
      #default
    >
      <BasePage
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
            :prepend-inner-icon="mdiMagnify"
            :label="t('search')"
          />
        </template>
        <template #default>
          <EditorFormSchemaBacklog
            v-if="objectSchema && formSchema"
            :object-schema="objectSchema"
            :form-schema="formSchema"
            :search-query="searchQuery"
            @control-items="updateControlItems"
          />
        </template>
      </BasePage>
      <BasePage
        heading-level="3"
        :title="t('usedControls')"
        :titlebar-alignment="PageHeaderAlignment.CENTER"
      >
        <template #default>
          <div class="fill-height fill-width d-flex">
            <EditorFormSchemaPlayground
              v-if="formSchema"
              v-model="formSchema.content"
              @set-translations="updateTranslations"
            />
            <v-progress-circular
              v-else
              size="64"
              indeterminate
            />
          </div>
        </template>
      </BasePage>
      <BasePage
        v-if="!xs"
        height="100%"
        heading-level="3"
        :title="t('preview')"
        :titlebar-alignment="PageHeaderAlignment.CENTER"
      >
        <template #default>
          <DynamicFormEntrypoint
            v-if="formSchema && objectSchema"
            v-model="objectData"
            :object-schema="objectSchema"
            :form-schema="formSchema.content"
            :translations="translations"
            :additional-context="additionalContext"
            :locale="language"
          />
        </template>
      </BasePage>
    </template>
    <template
      v-else
      #default
    >
      <BasePage>
        <UtilValidationResults
          v-if="schemaIsValid.errors.length"
          v-bind="validationActions"
          :messages="schemaIsValid"
        />
      </BasePage>
    </template>
    <template #helpers>
      <EditorFormSchemaWizardDialog
        :model-value="creationDialogVisible"
        :domain-id="domainId"
        @done="onWizardFinished"
      />
      <EditorErrorDialog
        v-model="errorDialogVisible"
        :validation="schemaIsValid"
        v-bind="validationActions"
      />
      <EditorFormSchemaCodeEditorDialog
        v-model="codeEditorVisible"
        :code="code"
      />
      <EditorFormSchemaInvalidSchemaDownloadDialog
        v-model="invalidSchemaDownloadDialogVisible"
        @download="downloadSchema(true)"
      />
      <!-- Important: translationDialogVisible should be in v-if to only run code in the dialog when it is open  -->
      <EditorFormSchemaTranslationDialog
        v-if="translationDialogVisible && formSchema && formSchema.translation"
        v-model="translationDialogVisible"
        v-model:current-display-language="language"
        :translations="formSchema.translation"
        :available-languages="availableLanguages"
        :name="formSchema.name"
        @update-translation="setFormTranslation"
        @update-name="setFormName"
      />
      <EditorFormSchemaDetailsDialog
        v-if="formSchema && objectSchema"
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
  </LayoutPageWrapper>
</template>

<script lang="ts">
export const PROVIDE_KEYS = {
  language: 'language',
  objectSchema: 'mainObjectSchema',
  objectSchemaTranslations: 'os_translations',
  formSchemaTranslations: 'fs_translations'
};

import { Ref } from 'vue';
import { mdiAlertCircleOutline, mdiCodeTags, mdiContentSave, mdiDownload, mdiHelpCircleOutline, mdiInformationOutline, mdiMagnify, mdiTranslate, mdiWrench } from '@mdi/js';
import { useDisplay } from 'vuetify';

import { deleteElementCustomTranslation, validate } from '~/lib/FormSchemaHelper';
import {
  IVeoObjectSchema, IVeoFormSchemaTranslationCollection } from '~/types/VeoTypes';
import { separateUUIDParam } from '~/lib/utils';
import { PageHeaderAlignment } from '~/components/layout/PageHeader.vue';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { ROUTE as HELP_ROUTE } from '~/pages/help/index.vue';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import formQueryDefinitions, { IVeoFormSchema, IVeoFormSchemaItem, IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import { IVeoTranslations } from '~~/composables/api/queryDefinitions/translations';
import { useMutation } from '~~/composables/api/utils/mutation';
import { useQuery } from '~~/composables/api/utils/query';
import { PENDING_TRANSLATIONS } from '~~/components/editor/formSchema/playground/EditElementDialog.vue';
import { JsonPointer } from 'json-ptr';
import { cloneDeep, isArray } from 'lodash';
import { IEditorTranslations } from '~/components/editor/translations/Translations.vue';
import { TRANSLATION_SOURCE } from '~/components/editor/translations/types';

export default defineComponent({
  setup() {
    const { locale, locales, t } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });
    const route = useRoute();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { ability } = useVeoPermissions();
    const { xs } = useDisplay();

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
      const headline = globalT('editor.formschema.headline');
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
    provide(PROVIDE_KEYS.language, language);

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
    const { mutateAsync: create } = useMutation(formQueryDefinitions.mutations.createForm, {
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
    const { mutateAsync: update } = useMutation(formQueryDefinitions.mutations.updateForm);

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
      if(!formSchema.value) {
        return;
      }
      formSchema.value.name[language.value] = value;
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

    const updateTranslations = (translations: PENDING_TRANSLATIONS) => {
      if(!formSchema.value) {
        return;
      }
      for(const language of Object.keys(translations)) {
        if(!formSchema.value.translation[language]) {
          formSchema.value.translation[language] = {};
        }
        for(const translationKey of Object.keys(translations[language])) {
          const value = translations[language][translationKey];
          if(value) {
            formSchema.value.translation[language][translationKey] = value;
          } else {
            delete formSchema.value.translation[language][translationKey];
          }
        }
      }
    };

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

    // TODO: during the refactoring process, look if controlItems here and in Backlog can be removed
    function updateControlItems(items: any) {
      controlItems.value = items;
    }

    const fetchDomainQueryParameters = computed(() => ({ id: domainId.value }));
    const { data: domain } = useQuery(domainQueryDefinitions.queries.fetchDomain, fetchDomainQueryParameters);

    /**
     * Translations related stuff
     */
    const translationsQueryParameters = computed(() => ({ languages: (locales.value as LocaleObject[]).map((locale) => locale.code) }));
    const { data: translationsQueryData } = useQuery(translationQueryDefinitions.queries.fetch, translationsQueryParameters);

    const translations = computed(() => {
      const _translations: IEditorTranslations = new Map();

      // If no objectschema is present, no need to iterate over all translations
      if(objectSchema.value?.title) {
        // Iterate over all objectschema translations that belong to this formschemas objectschema
        for(const [locale, osLanguageTranslation] of Object.entries(translationsQueryData.value?.lang || {})) {
          for(const [translationKey, translationValue] of Object.entries(osLanguageTranslation)) {

            // Skip translations not belonging to this objectschema
            if(!translationKey.startsWith(objectSchema.value.title)) {
              continue;
            }

            if(!_translations.has(translationKey)) {
              _translations.set(translationKey, new Map());
            }
            if(!_translations.get(translationKey)?.has(TRANSLATION_SOURCE.OBJECTSCHEMA)) {
              _translations.get(translationKey)?.set(TRANSLATION_SOURCE.OBJECTSCHEMA, new Map());
            }
            _translations.get(translationKey)?.get(TRANSLATION_SOURCE.OBJECTSCHEMA)?.set(locale, translationValue);
          }
        }
      }

      return _translations;
    });
    const translationDialogVisible: Ref<boolean> = ref(false);

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

    const objectSchemaTranslations = computed(() => translation.value?.lang);
    const formSchemaTranslations = computed(() => formSchema.value?.translation);

    provide(PROVIDE_KEYS.objectSchemaTranslations, objectSchemaTranslations);
    provide(PROVIDE_KEYS.formSchemaTranslations, formSchemaTranslations);

    const validationActions: Record<string, (errorCode: string, details: Record<string, any>) => void> = {
      onFix: (errorCode, details) => {
        switch(errorCode) {
          case 'E_PROPERTY_MISSING':
            if(formSchema.value) {
              const toModify = cloneDeep(formSchema.value);
              const elementFormSchema = JsonPointer.get(toModify.content, details.formSchemaPointer) as IVeoFormSchemaItem;
              deleteElementCustomTranslation(elementFormSchema, toModify.translation, setFormTranslation);
              // You can't delete the root object
              if (details.formSchemaPointer && details.formSchemaPointer !== '#') {
                const parts = details.formSchemaPointer.split('/');
                const lastPart = parts.pop();
                const partToModify: any = JsonPointer.get(toModify.content, parts.join('/'));
                if(isArray(partToModify)) {
                  partToModify.splice(parseInt(lastPart), 1);
                } else {
                  delete partToModify[lastPart];
                }
                JsonPointer.set(toModify.content, parts.join('/'), partToModify);
              }
              formSchema.value = toModify;
            }
        }
      }
    };

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
      updateControlItems,
      invalidSchemaDownloadDialogVisible,
      downloadButton,
      code,
      translationDialogVisible,
      onClickTranslationBtn,
      setFormTranslation,
      setFormName,
      PageHeaderAlignment,
      save,
      translations,
      updateTranslations,
      onWizardFinished,
      validationActions,

      mdiAlertCircleOutline,
      mdiCodeTags,
      mdiContentSave,
      mdiDownload,
      mdiHelpCircleOutline,
      mdiInformationOutline,
      mdiMagnify,
      mdiTranslate,
      mdiWrench,
      t,
      globalT,
      HELP_ROUTE,
      xs
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
