<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann, Samuel Vitzthum
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
    class="bg-basepage pt-6"
    collapsable-right
    :page-widths="pageWidths"
    @page-collapsed="onPageCollapsed"
  >
    <template #default>
      <BasePage v-if="objectSchemaHelper" sticky-header>
        <template #header>
          <div class="d-flex flex-row bg-accent">
            <v-spacer />
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
                  <v-btn class="bg-accent" icon large variant="text">
                    <v-icon :icon="mdiDownload" />
                  </v-btn>
                </a>
              </template>
              <template #default>
                {{ globalT('editor.schema.download') }}
              </template>
            </v-tooltip>
            <v-tooltip location="bottom">
              <template #activator="{ props }">
                <v-btn
                  v-if="schemaIsValid.warnings.length > 0"
                  :icon="mdiAlertCircleOutline"
                  large
                  color="warning"
                  class="ml-2"
                  v-bind="props"
                  variant="text"
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
                  large
                  class="translate-button bg-accent"
                  v-bind="props"
                  variant="text"
                  @click="translationDialogVisible = true"
                />
              </template>
              <template #default>
                {{ t('translations') }}
              </template>
            </v-tooltip>
            <v-tooltip location="bottom">
              <template #activator="{ props }">
                <v-btn
                  :icon="mdiWrench"
                  large
                  class="bg-accent"
                  v-bind="props"
                  variant="text"
                  @click="detailsDialogVisible = !detailsDialogVisible"
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
                  large
                  target="_blank"
                  :to="HELP_ROUTE"
                  class="help-button bg-accent"
                  variant="text"
                  v-bind="props"
                />
              </template>
              <template #default>
                {{ t('help') }}
              </template>
            </v-tooltip>
            <!-- @vue-ignore TODO #3066 $route does not exist -->
            <v-tooltip v-if="$route.query.os" location="bottom">
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-btn
                    :disabled="!schemaIsValid.valid || ability.cannot('manage', 'editors')"
                    :icon="mdiContentSave"
                    large
                    class="bg-accent"
                    variant="text"
                    @click="saveSchema"
                  />
                </div>
              </template>
              <template #default>
                <span v-if="ability.can('manage', 'editors')">{{ upperFirst(t('save').toString()) }}</span>
                <span v-else>{{ t('saveContentCreator') }}</span>
              </template>
            </v-tooltip>
          </div>
          <v-row v-if="schemaIsValid.valid" no-gutters class="flex-column overflow-hidden fill-width bg-surface">
            <v-col>
              <v-row class="mx-2 mt-1">
                <v-col cols="12" lg="6">
                  <v-text-field
                    :model-value="title"
                    dense
                    hide-details
                    flat
                    :label="t('objectschema')"
                    variant="underlined"
                    @update:model-value="updateSchemaName"
                  />
                </v-col>
                <v-col cols="12" lg="6">
                  <v-text-field
                    :model-value="description"
                    dense
                    hide-details
                    :label="t('description')"
                    variant="underlined"
                    @update:model-value="updateDescription"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row v-if="schemaIsValid.valid" no-gutters class="flex-column overflow-hidden fill-width bg-surface">
            <v-col>
              <v-row class="ml-2 my-1">
                <v-col cols="12" lg="6">
                  <v-text-field
                    v-model="searchQuery"
                    dense
                    clearable
                    flat
                    filled
                    hide-details
                    :prepend-inner-icon="mdiMagnify"
                    :label="t('search')"
                    variant="underlined"
                  />
                </v-col>
                <v-col>
                  <v-checkbox
                    v-model="hideEmptyAspects"
                    class="caption"
                    dense
                    hide-details
                    :label="t('hideemptyaspects')"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-divider class="mt-4" />
        </template>
        <template #default>
          <!-- @vue-ignore TODO #3066 $route does not exist -->
          <EditorObjectSchemaMain
            v-if="schemaIsValid.valid"
            :search="searchQuery"
            :hide-empty-aspects="hideEmptyAspects"
            :domain-id="$route.params.domain as string"
            @schema-updated="updateCode"
          />
          <v-row v-else class="fill-height flex-column text-center align-center px-8">
            <v-col cols="auto" style="flex-grow: 0">
              <v-icon style="font-size: 8rem; opacity: 0.5" color="primary" :icon="mdiInformationOutline" />
            </v-col>
            <v-col cols="auto" class="text-left">
              <h3 class="text-h3">
                {{ t('invalidObjectSchema') }}
              </h3>
              <v-list-item v-for="(error, index) of schemaIsValid.errors" :key="`e_${index}`" link>
                <v-list-item-title>{{ error.code }}</v-list-item-title>
                <v-list-item-subtitle>{{ error.message }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-spacer />
          </v-row>
        </template>
      </BasePage>
      <BasePage v-if="objectSchemaHelper && !xs" height="100%" content-class="ose__code-editor">
        <EditorSchemaCodeEditor v-model="code" @schema-updated="updateSchema" />
      </BasePage>
    </template>
    <template #helpers>
      <EditorObjectSchemaWizardDialog v-model="creationDialogVisible" @completed="setSchema" />
      <!-- @vue-ignore TODO #3066 $route does not exist -->
      <EditorObjectSchemaDetailsDialog
        v-model="detailsDialogVisible"
        :domain-id="$route.params.domain as string"
        @schema-updated="updateCode"
      />
      <EditorErrorDialog v-model="errorDialogVisible" :validation="schemaIsValid" />
      <EditorObjectSchemaTranslationDialog
        v-if="!translationsLoading && translationDialogVisible"
        v-model="translationDialogVisible"
        v-model:current-display-language="displayLanguage"
        :available-languages="availableLanguages"
        @schema-updated="updateCode"
      />
    </template>
  </LayoutPageWrapper>
</template>

<script lang="ts">
import { upperFirst, pickBy } from 'lodash';
import {
  mdiAlertCircleOutline,
  mdiContentSave,
  mdiDownload,
  mdiHelpCircleOutline,
  mdiInformationOutline,
  mdiMagnify,
  mdiTranslate,
  mdiWrench
} from '@mdi/js';
import { useDisplay } from 'vuetify';

import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';
import ObjectSchemaHelper from '~/lib/ObjectSchemaHelper2';
import { IVeoObjectSchema } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { ROUTE as HELP_ROUTE } from '~/pages/help/index.vue';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import translationQueryDefinitions, { IVeoTranslations } from '~/composables/api/queryDefinitions/translations';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import type { LocaleObject } from '@nuxtjs/i18n';
import { useQuery } from '~/composables/api/utils/query';
import { useMutation } from '~/composables/api/utils/mutation';

export default defineComponent({
  name: 'ObjectSchemaEditor',
  setup() {
    const { locale, locales, t } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });
    const route = useRoute();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { ability } = useVeoPermissions();
    const { xs } = useDisplay();

    const objectSchemaHelper = ref<ObjectSchemaHelper | undefined>(undefined);

    const displayLanguage = ref(locale.value);
    watch(
      () => locale.value,
      (newValue) => {
        displayLanguage.value = newValue;
      }
    );

    provide('displayLanguage', displayLanguage);
    provide('objectSchemaHelper', objectSchemaHelper);

    // Layout stuff
    const pageWidths = ref([6, 6]);

    const creationDialogVisible = ref(true);
    const errorDialogVisible = ref(false);
    const translationDialogVisible = ref(false);
    const detailsDialogVisible = ref(false);

    const fetchTranslationQueryParameters = computed(() => ({
      languages: (locales.value as LocaleObject[]).map((locale) => locale.code),
      domain: route.params.domain
    }));
    const translations = reactive<IVeoTranslations['lang']>({});
    const { data: _translations, isFetching: translationsLoading } = useQuery(
      translationQueryDefinitions.queries.fetch,
      fetchTranslationQueryParameters
    );
    watch(
      () => _translations.value,
      (newValue) => Object.assign(translations, newValue?.lang || {}),
      { deep: true, immediate: true }
    );
    const availableLanguages = computed(() => Object.keys(translations));

    const code = ref('');
    const schemaIsValid = ref<VeoSchemaValidatorValidationResult>({
      valid: false,
      errors: [],
      warnings: []
    });

    // Editor stuff
    const hideEmptyAspects = ref(false);
    const searchQuery = ref<string | undefined>(undefined);

    // Schema stuff
    const title = computed(() => objectSchemaHelper.value?.getTitle() || '');
    const description = computed(() => objectSchemaHelper.value?.getDescription() || '');

    const schemaSpecificTranslations = computed<IVeoTranslations['lang']>(() => {
      const translationsToReturn: IVeoTranslations['lang'] = {};
      const schemaTitle = `${objectSchemaHelper.value?.getTitle()}_` || '';

      for (const language of availableLanguages.value) {
        translationsToReturn[language] = pickBy(translations[language], (_value, key) => key.startsWith(schemaTitle));
      }

      return translationsToReturn;
    });

    const setSchema = (data: { schema?: IVeoObjectSchema; meta: { type: string; description: string } }) => {
      objectSchemaHelper.value =
        data.schema || data.meta ? new ObjectSchemaHelper(data.schema, route.params.domain as string) : undefined;

      if (objectSchemaHelper.value) {
        if (data.meta) {
          objectSchemaHelper.value.setTitle(data.meta.type);
          objectSchemaHelper.value.setDescription(data.meta.description);
        }

        if (objectSchemaHelper.value.getLanguages().length === 0) {
          for (const [languageKey, translations] of Object.entries(schemaSpecificTranslations.value)) {
            objectSchemaHelper.value.updateTranslations(languageKey, translations);
          }
        }
        code.value = JSON.stringify(objectSchemaHelper.value.toSchema(), undefined, 2);
        validate();
      }

      creationDialogVisible.value = !objectSchemaHelper.value || false;
    };

    const updateSchema = (schema: IVeoObjectSchema) => {
      objectSchemaHelper.value = new ObjectSchemaHelper(schema);
      code.value = JSON.stringify(objectSchemaHelper.value.toSchema(), undefined, 2);
      objectSchemaHelper.value = new ObjectSchemaHelper(JSON.parse(code.value));

      validate();
    };

    const updateSchemaName = (name: string) => {
      objectSchemaHelper.value?.changeTranslationKey(objectSchemaHelper.value.getTitle(), name);
      objectSchemaHelper.value?.setTitle(name);
      code.value = JSON.stringify(objectSchemaHelper.value?.toSchema(), undefined, 2);
    };

    const updateDescription = (description: string) => {
      objectSchemaHelper.value?.setDescription(description);
      code.value = JSON.stringify(objectSchemaHelper.value?.toSchema(), undefined, 2);
    };

    const updateCode = () => {
      if (objectSchemaHelper.value) {
        code.value = JSON.stringify(objectSchemaHelper.value.toSchema(), undefined, 2);
        validate();
      }
    };

    const downloadButton = ref();
    const downloadSchema = () => {
      if (downloadButton.value) {
        const data = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(objectSchemaHelper.value?.toSchema(), undefined, 2)
        )}`;
        (downloadButton.value as any).href = data;
        (downloadButton.value as any).download = `os_${objectSchemaHelper.value?.getTitle() || 'download'}.json`;
      }
    };

    const validate = () => {
      schemaIsValid.value = objectSchemaHelper.value?.validate() || {
        valid: false,
        errors: [],
        warnings: []
      };
    };

    const onDisplayLanguageUpdate = (newLanguage: string) => {
      displayLanguage.value = newLanguage;
    };

    const onPageCollapsed = (collapsedPages: boolean[]) => {
      if (collapsedPages[1]) {
        pageWidths.value = [12, 0];
      } else {
        pageWidths.value = [6, 6];
      }
    };

    // Saving
    const { mutateAsync: update } = useMutation(domainQueryDefinitions.mutations.updateTypeDefinitions);

    const saveSchema = async () => {
      const objectSchema = objectSchemaHelper.value?.toSchema();
      if (!objectSchema) {
        return;
      }

      try {
        await update({
          domainId: route.params.domain,
          objectType: title.value,
          objectSchema
        });
        displaySuccessMessage(t('saveSchemaSuccess').toString());
      } catch (e: any) {
        displayErrorMessage(
          globalT('userMessages.error.title').toString(),
          `${t('saveSchemaError').toString()}: ${e.message}`
        );
      }
    };

    return {
      ability,
      availableLanguages,
      code,
      creationDialogVisible,
      description,
      detailsDialogVisible,
      displayLanguage,
      downloadButton,
      downloadSchema,
      errorDialogVisible,
      hideEmptyAspects,
      objectSchemaHelper,
      onDisplayLanguageUpdate,
      onPageCollapsed,
      pageWidths,
      saveSchema,
      schemaIsValid,
      searchQuery,
      setSchema,
      title,
      translationDialogVisible,
      translationsLoading,
      updateCode,
      updateSchema,
      updateSchemaName,
      updateDescription,

      t,
      globalT,
      upperFirst,
      mdiAlertCircleOutline,
      mdiContentSave,
      mdiDownload,
      mdiHelpCircleOutline,
      mdiInformationOutline,
      mdiMagnify,
      mdiTranslate,
      mdiWrench,
      HELP_ROUTE,
      xs
    };
  }
});
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-editor-objectschema.json"></i18n>

<style lang="scss" scoped>
.ose__code-editor {
  height: 100%;
}
</style>
