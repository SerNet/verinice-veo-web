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
    title-class="d-flex align-center bg-basepage"
    :collapsable-left="schemaIsValid.valid"
    :collapsable-right="schemaIsValid.valid"
  >
    <template v-if="formSchema && objectSchema" #header>
      <!-- Toolbar -->
      <div class="ma-6 ml-4" style="width: 120px">
        <v-select
          v-model="editorLanguage"
          :items="locales"
          item-value="code"
          item-title="code"
          :label="t('viewIn')"
          density="compact"
          variant="solo"
          hide-details
          flat
        />
      </div>

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
            <v-btn :icon="mdiDownload" class="bg-surface mr-1" size="small" variant="text" />
          </a>
        </template>
        <template #default>
          {{ globalT('editor.schema.download') }}
        </template>
      </v-tooltip>

      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :icon="mdiCodeTags"
            class="bg-surface mr-1"
            size="small"
            variant="text"
            @click="codeEditorVisible = true"
          />
        </template>
        <template #default>
          {{ t('formSchemaCode') }}
        </template>
      </v-tooltip>

      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-if="!schemaIsValid.valid"
            :icon="mdiAlertCircleOutline"
            size="small"
            variant="text"
            color="warning"
            class="ml-2"
            v-bind="props"
            @click="errorDialogVisible = !errorDialogVisible"
          />
        </template>
        <template #default>
          {{ globalT('editor.schema.warnings') }}
        </template>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            :icon="mdiTranslate"
            class="bg-surface mr-1"
            size="small"
            variant="text"
            v-bind="props"
            @click="translationDialogVisible = true"
          />
        </template>
        <template #default>
          {{ globalT('editor.formschema.translation') }}
        </template>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :icon="mdiWrench"
            class="bg-surface mr-1"
            size="small"
            variant="text"
            @click="detailDialogVisible = !detailDialogVisible"
          />
        </template>
        <template #default>
          {{ globalT('editor.schema.properties') }}
        </template>
      </v-tooltip>

      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            :icon="mdiHelpCircleOutline"
            size="small"
            variant="text"
            target="_blank"
            :to="HELP_ROUTE"
            class="help-button bg-surface mr-1"
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
              class="bg-surface mr-3"
              size="small"
              variant="text"
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
    <!-- Toolbar END -->

    <template v-if="formSchema && objectSchema && schemaIsValid.valid" #default>
      <BasePage
        heading-level="3"
        sticky-header
        :title="t('availableControls')"
        :titlebar-alignment="PageHeaderAlignment.CENTER"
      >
        <!-- Search -->
        <template #header>
          <v-text-field
            v-model="searchQuery"
            class="mt-0 bg-surface"
            dense
            flat
            clearable
            hide-details
            filled
            :prepend-inner-icon="mdiMagnify"
            :label="t('search')"
          />
        </template>

        <!-- Backlog / Available Controls -->
        <template #default>
          <EditorFormSchemaBacklog
            v-if="objectSchema && formSchema"
            :object-schema="objectSchema"
            :form-schema="formSchema"
            :search-query="searchQuery"
            :domain="domain"
            @control-items="updateControlItems"
          />
        </template>
      </BasePage>

      <BasePage heading-level="3" :title="t('usedControls')" :titlebar-alignment="PageHeaderAlignment.CENTER">
        <!-- Playground / Currently used controls -->
        <template #default>
          <div class="fill-height fill-width d-flex mt-2">
            <EditorFormSchemaPlayground
              v-if="formSchema"
              v-model="formSchema.content"
              :object-schema="objectSchema"
              @set-translations="setElementTranslation"
            />
            <v-progress-circular v-else size="64" indeterminate />
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
        <!-- Preview / Dynamic form -->
        <template #default>
          <DynamicFormEntrypoint
            v-if="formSchema && objectSchema"
            v-model="objectData"
            class="bg-surface"
            :object-schema="objectSchema"
            :form-schema="formSchema.content"
            :translations="eligibleTranslations"
            :reactive-form-actions="reactiveFormActions"
            :additional-context="getRiskAdditionalContext(objectSchema.title, domain, locale, t)"
            :domain="domain"
            :locale="editorLanguage"
          />
        </template>
      </BasePage>
    </template>

    <template v-else #default>
      <BasePage>
        <UtilValidationResults
          v-if="schemaIsValid.errors.length"
          v-bind="validationActions"
          :messages="schemaIsValid"
        />
      </BasePage>
    </template>

    <template #helpers>
      <!-- @vue-ignore TODO #3066 $route does not exist -->
      <EditorFormSchemaWizardDialog
        :model-value="creationDialogVisible"
        :domain-id="$route.params.domain as string"
        @done="onWizardFinished"
      />
      <EditorErrorDialog v-model="errorDialogVisible" v-bind="validationActions" :validation="schemaIsValid" />
      <EditorFormSchemaCodeEditorDialog v-model="codeEditorVisible" :code="code" />
      <EditorFormSchemaInvalidSchemaDownloadDialog
        v-model="invalidSchemaDownloadDialogVisible"
        @download="downloadSchema(true)"
      />
      <EditorFormSchemaTranslationDialog
        v-model="translationDialogVisible"
        :form-schema-titles="formSchema?.name"
        @update:form-schema-titles="formSchema ? (formSchema.name = $event) : undefined"
      />
      <!-- @vue-ignore TODO #3066 $route does not exist -->
      <EditorFormSchemaDetailsDialog
        v-if="formSchema && objectSchema"
        v-model="detailDialogVisible"
        v-model:sub-type="formSchema.subType"
        v-model:sorting="formSchema.sorting"
        v-model:context="formSchema.context"
        :object-schema="objectSchema"
        :form-schema="formSchema.name[editorLanguage]"
        :domain-id="$route.params.domain as string"
      />
    </template>
  </LayoutPageWrapper>
</template>

<script lang="ts">
export const PROVIDE_KEYS = {
  EDITOR_LANGUAGE: 'editorLanguage',
  TRANSLATIONS: 'translations',
  FORMSCHEMA: 'mainFormSchema',
  OBJECTSCHEMA: 'mainObjectSchema'
};
</script>

<script setup lang="ts">
import {
  mdiAlertCircleOutline,
  mdiCodeTags,
  mdiContentSave,
  mdiDownload,
  mdiHelpCircleOutline,
  mdiMagnify,
  mdiTranslate,
  mdiWrench
} from '@mdi/js';

import { useDisplay } from 'vuetify';
import { JsonPointer } from 'json-ptr';
import { cloneDeep, isArray } from 'lodash';

import { getRiskAdditionalContext } from '~/components/dynamic-form/additionalContext';
import { deleteFormSchemaElementTranslations, validate } from '~/lib/FormSchemaHelper';
import type { IVeoDomainSpecificObjectSchema } from '~/types/VeoTypes';
import { PageHeaderAlignment } from '~/components/layout/PageHeader.vue';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { ROUTE as HELP_ROUTE } from '~/pages/help/index.vue';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import type { IVeoFormSchema, IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import formQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery } from '~/composables/api/utils/query';
import type { LocaleObject } from '@nuxtjs/i18n';
import type { PENDING_TRANSLATIONS } from '~/components/editor/formSchema/playground/EditElementDialog.vue';
import type { IEditorTranslations } from '~/components/editor/translations/types';
import { TRANSLATION_SOURCE } from '~/components/editor/translations/types';
import { editorTranslationsToFormsTranslations } from '~/components/editor/translations/util';
import type { IVeoFormsReactiveFormActions } from '~/components/dynamic-form/types';
import { useVeoReactiveFormActions } from '~/composables/VeoReactiveFormActions';

const { locale, locales, t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const route = useRoute();
const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
const { ability } = useVeoPermissions();
const { xs } = useDisplay();
const { riskReactiveFormActions } = useVeoReactiveFormActions();

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

/**
 * Schema related stuff
 */
const objectSchema: Ref<IVeoDomainSpecificObjectSchema | undefined> = ref(undefined);
const formSchema: Ref<IVeoFormSchema | undefined> = ref(undefined);
provide(PROVIDE_KEYS.OBJECTSCHEMA, objectSchema);
provide(PROVIDE_KEYS.FORMSCHEMA, formSchema);
const objectData = ref({});

const schemaIsValid = computed(() =>
  formSchema.value ? validate(formSchema.value, objectSchema.value) : { valid: false, errors: [], warnings: [] }
);

const code = computed(() => (formSchema.value ? JSON.stringify(formSchema.value, undefined, 2) : ''));

const onWizardFinished = (payload: { formSchema: IVeoFormSchema; objectSchema: IVeoDomainSpecificObjectSchema }) => {
  formSchema.value = payload.formSchema;
  objectSchema.value = payload.objectSchema;
};

// Create/update stuff
const createFormSchemaQueryParameters = computed(() => ({
  domainId: route.params.domain as string,
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
  domainId: route.params.domain as string,
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

const invalidSchemaDownloadDialogVisible = ref(false);
function downloadSchema(forceDownload = false) {
  if (schemaIsValid.value.valid === false && !forceDownload) {
    invalidSchemaDownloadDialogVisible.value = true;
  } else if (downloadButton.value && downloadButton.value !== null) {
    invalidSchemaDownloadDialogVisible.value = false;
    const data = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(formSchema.value, undefined, 2))}`;
    downloadButton.value.href = data;
    downloadButton.value.download = `fs_${formSchema.value?.name[editorLanguage.value] || 'missing_translation'}.json`;
  }
}

const reactiveFormActions = computed<IVeoFormsReactiveFormActions>(() => {
  const riskDefinitionId = Object.keys(objectSchema.value?.properties?.riskValues?.properties ?? {})[0];

  return {
    ...(riskDefinitionId !== undefined && ['process', 'asset', 'scope'].includes(objectSchema.value?.title || '') ?
      riskReactiveFormActions(
        riskDefinitionId,
        Object.keys(
          objectSchema.value?.properties?.riskValues?.properties?.[riskDefinitionId]?.properties?.potentialImpacts
            ?.properties
        )
      )
    : {})
  };
});

// TODO: during the refactoring process, look if controlItems here and in Backlog can be removed
function updateControlItems(items: any) {
  controlItems.value = items;
}

/**
 * Translations/language related stuff
 */
const editorLanguage = ref(locale.value);
provide(PROVIDE_KEYS.EDITOR_LANGUAGE, editorLanguage);

const translationsQueryParameters = computed(() => ({
  languages: (locales.value as LocaleObject[]).map((locale) => locale.code),
  domain: route.params.domain
}));
const { data: translationsQueryData } = useQuery(
  translationQueryDefinitions.queries.fetch,
  translationsQueryParameters
);

const setTranslation = (
  translations: IEditorTranslations,
  key: string,
  source: TRANSLATION_SOURCE,
  locale: string,
  value: string
) => {
  const _translations = cloneDeep(translations);

  if (!_translations[key]) {
    _translations[key] = Object.create(null);
  }
  if (!_translations[key][source]) {
    _translations[key][source] = Object.create(null);
  }
  _translations[key][source][locale] = value;
  return _translations;
};

const translations = computed({
  get: () => {
    let _translations: IEditorTranslations = Object.create(null);

    // If no objectschema is present, no need to iterate over all translations
    if (objectSchema.value?.title) {
      // Iterate over all objectschema translations that belong to this formschemas objectschema
      for (const [locale, osLanguageTranslations] of Object.entries(translationsQueryData.value?.lang || {})) {
        for (const [translationKey, translationValue] of Object.entries(osLanguageTranslations)) {
          // Skip translations not belonging to a different objectschema
          if (translationKey.includes('_') && !translationKey.startsWith(objectSchema.value.title)) {
            continue;
          }
          _translations = setTranslation(
            _translations,
            translationKey,
            TRANSLATION_SOURCE.OBJECTSCHEMA,
            locale,
            translationValue
          );
        }
      }

      // Iterate over all formschema translations
      for (const [locale, fsLanguageTranslations] of Object.entries(formSchema.value?.translation || {})) {
        for (const [translationKey, translationValue] of Object.entries(fsLanguageTranslations)) {
          _translations = setTranslation(
            _translations,
            translationKey,
            TRANSLATION_SOURCE.FORMSCHEMA,
            locale,
            translationValue
          );
        }
      }
    }

    return _translations;
  },
  set: (newTranslations) => {
    if (!formSchema.value) {
      throw new Error('FormschemaEditor::translations:setter: Formschema not defined');
    }
    const newFormSchemaTranslations = Object.create(null);

    // Iterate over all translations
    for (const [translationKey, translation] of Object.entries(newTranslations)) {
      for (const [translationSource, values] of Object.entries(translation)) {
        // The formschema editor is only allowed to update formschema translations!!!
        if (parseInt(translationSource, 10) !== TRANSLATION_SOURCE.FORMSCHEMA) {
          continue;
        }

        for (const [locale, localeValue] of Object.entries(values)) {
          if (!newFormSchemaTranslations[locale]) {
            newFormSchemaTranslations[locale] = Object.create(null);
          }
          if (!newFormSchemaTranslations[locale][translationKey]) {
            newFormSchemaTranslations[locale][translationKey] = Object.create(null);
          }
          newFormSchemaTranslations[locale][translationKey] = localeValue;
        }
      }
    }
    formSchema.value.translation = newFormSchemaTranslations;
  }
});
provide(PROVIDE_KEYS.TRANSLATIONS, translations);

const eligibleTranslations = computed(() => editorTranslationsToFormsTranslations(translations.value));

const translationDialogVisible: Ref<boolean> = ref(false);

const setElementTranslation = (translations: PENDING_TRANSLATIONS) => {
  Object.entries(translations).forEach(([translationLocale, translationsForLocale]) => {
    Object.entries(translationsForLocale).forEach(([translationKey, translationValue]) => {
      if (!formSchema.value) {
        throw new Error('FormschemaEditor::setElementTranslation: Formschema not defined');
      }

      if (translationValue) {
        if (!formSchema.value.translation[translationLocale]) {
          formSchema.value.translation[translationLocale] = { [translationKey]: translationValue };
        } else {
          formSchema.value.translation[translationLocale][translationKey] = translationValue;
        }
      } else if (
        formSchema.value.translation[translationLocale] &&
        formSchema.value.translation[translationLocale][translationKey]
      ) {
        Reflect.deleteProperty(formSchema.value.translation[translationLocale], translationKey);
      }
    });
  });
};

const validationActions: Record<string, (errorCode: string, details: Record<string, any>) => void> = {
  onFix: (errorCode, details) => {
    switch (errorCode) {
      case 'E_PROPERTY_MISSING':
        if (formSchema.value) {
          const toModify = cloneDeep(formSchema.value);
          const elementFormSchema = JsonPointer.get(toModify.content, details.formSchemaPointer) as IVeoFormSchemaItem;

          formSchema.value = deleteFormSchemaElementTranslations(formSchema.value, elementFormSchema);
          // You can't delete the root object
          if (details.formSchemaPointer && details.formSchemaPointer !== '#') {
            const parts = details.formSchemaPointer.split('/');
            const lastPart = parts.pop();
            const partToModify: any = JsonPointer.get(toModify.content, parts.join('/'));
            if (isArray(partToModify)) {
              partToModify.splice(parseInt(lastPart), 1);
            } else {
              Reflect.deleteProperty(partToModify, lastPart);
            }
            JsonPointer.set(toModify.content, parts.join('/'), partToModify);
          }
          formSchema.value = toModify;
        }
    }
  }
};

const fetchDomainQueryParameters = computed(() => ({
  id: route.params.domain as string
}));

const fetchDomainQueryEnabled = computed(() => !!route.params.domain);
const { data: domain } = useQuery(domainQueryDefinitions.queries.fetchDomain, fetchDomainQueryParameters, {
  enabled: fetchDomainQueryEnabled
});
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-editor-formschema.json"></i18n>

<style lang="scss" scoped></style>
