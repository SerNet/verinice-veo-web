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
  <VeoPageWrapper
    collapsable-right
    :page-widths="pageWidths"
    @page-collapsed="onPageCollapsed"
  >
    <template #default>
      <VeoPage
        v-if="objectSchemaHelper"
        sticky-header
      >
        <template #header>
          <div class="d-flex flex-row align-center">
            <h1 class="text-h1">
              {{ $t('editor.objectschema.headline') }}
            </h1>
            <v-tooltip bottom>
              <template #activator="{on}">
                <a
                  ref="downloadButton"
                  v-cy-name="'download-button'"
                  href="#"
                  class="text-decoration-none"
                  style="vertical-align: bottom;"
                  @click="downloadSchema()"
                  v-on="on"
                >
                  <v-btn
                    icon
                    large
                    color="primary"
                  >
                    <v-icon v-text="mdiDownload" />
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
                  @click="errorDialogVisible = !errorDialogVisible"
                  v-on="on"
                >
                  <v-icon v-text="mdiAlertCircleOutline" />
                </v-btn>
              </template>
              <template #default>
                {{ $t('editor.schema.warnings') }}
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn
                  icon
                  large
                  class="translate-button"
                  color="primary"
                  @click="translationDialogVisible = true"
                  v-on="on"
                >
                  <v-icon v-text="mdiTranslate" />
                </v-btn>
              </template>
              <template #default>
                {{ $t('translations') }}
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-btn
                  icon
                  large
                  color="primary"
                  @click="detailsDialogVisible = !detailsDialogVisible"
                  v-on="on"
                >
                  <v-icon v-text="mdiWrench" />
                </v-btn>
              </template>
              <template #default>
                {{ $t("editor.schema.properties") }}
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
                  <v-icon v-text="mdiHelpCircleOutline" />
                </v-btn>
              </template>
              <template #default>
                {{ $t('help') }}
              </template>
            </v-tooltip>
            <v-tooltip
              v-if="$route.query.os"
              bottom
            >
              <template #activator="{on}">
                <div v-on="on">
                  <v-btn
                    :disabled="!schemaIsValid.valid || !isContentCreator"
                    icon
                    large
                    color="primary"
                    @click="saveSchema"
                  >
                    <v-icon v-text="mdiContentSave" />
                  </v-btn>
                </div>
              </template>
              <template #default>
                <span v-if="isContentCreator">{{ upperFirst($t('save').toString()) }}</span>
                <span v-else>{{ $t('saveContentCreator') }}</span>
              </template>
            </v-tooltip>
          </div>
          <v-row
            v-if="schemaIsValid.valid"
            no-gutters
            class="flex-column overflow-hidden py-2 fill-width"
          >
            <v-col>
              <v-row>
                <v-col
                  cols="12"
                  lg="4"
                >
                  <v-text-field
                    v-cy-name="'objectschema-title-input'"
                    :value="title"
                    dense
                    hide-details
                    flat
                    :label="$t('objectschema')"
                    @input="updateSchemaName"
                  />
                </v-col>
                <v-col
                  cols="12"
                  lg="8"
                >
                  <v-text-field
                    v-cy-name="'objectschema-description-input'"
                    :value="description"
                    dense
                    hide-details
                    :label="$t('description')"
                    @input="updateDescription"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row
            v-if="schemaIsValid.valid"
            dense
            class="flex-column"
          >
            <v-col>
              <v-text-field
                v-model="searchQuery"
                dense
                clearable
                flat
                filled
                hide-details
                :prepend-inner-icon="mdiMagnify"
                :label="$t('search')"
              />
            </v-col>
            <v-col>
              <v-checkbox
                v-model="hideEmptyAspects"
                class="caption"
                dense
                hide-details
                :label="$t('hideemptyaspects')"
              />
            </v-col>
          </v-row>
          <v-divider class="mt-2" />
        </template>
        <template #default>
          <VeoObjectSchemaEditor
            v-if="schemaIsValid.valid"
            :search="searchQuery"
            :hide-empty-aspects="hideEmptyAspects"
            :domain-id="domainId"
            @schema-updated="updateCode"
          />
          <v-row
            v-else
            class="fill-height flex-column text-center align-center px-8"
          >
            <v-col
              cols="auto"
              style="flex-grow: 0"
            >
              <v-icon
                style="font-size: 8rem; opacity: 0.5;"
                color="primary"
                v-text="mdiInformationOutline"
              />
            </v-col>
            <v-col
              cols="auto"
              class="text-left"
            >
              <h3 class="text-h3">
                {{ $t('invalidObjectSchema') }}
              </h3>
              <v-list-item
                v-for="(error, index) of schemaIsValid.errors"
                :key="`e_${index}`"
                link
              >
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
      <VeoPage
        v-if="objectSchemaHelper && !$vuetify.breakpoint.xs"
        height="100%"
        content-class="ose__code-editor"
      >
        <VeoSchemaCodeEditor
          v-model="code"
          @schema-updated="updateSchema"
        />
      </VeoPage>
    </template>
    <template #helpers>
      <VeoOseWizardDialog
        v-model="creationDialogVisible"
        @completed="setSchema"
      />
      <VeoOseDetailsDialog
        v-model="detailsDialogVisible"
        :domain-id="domainId"
        @schema-updated="updateCode"
      />
      <VeoEditorErrorDialog
        v-model="errorDialogVisible"
        :validation="schemaIsValid"
      />
      <VeoOseTranslationDialog
        v-if="!$fetchState.pending && translationDialogVisible"
        v-model="translationDialogVisible"
        :current-display-language="displayLanguage"
        :available-languages="availableLanguages"
        @display-language-changed="onDisplayLanguageUpdate"
        @schema-updated="updateCode"
      />
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import { computed, defineComponent, provide, reactive, ref, useContext, useFetch, useRoute, watch } from '@nuxtjs/composition-api';
import { upperFirst, pickBy } from 'lodash';
import { mdiAlertCircleOutline, mdiContentSave, mdiDownload, mdiHelpCircleOutline, mdiInformationOutline, mdiMagnify, mdiTranslate, mdiWrench } from '@mdi/js';
import { useI18n } from 'nuxt-i18n-composable';

import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';
import ObjectSchemaHelper from '~/lib/ObjectSchemaHelper2';
import { IVeoObjectSchema, IVeoTranslations } from '~/types/VeoTypes';
import { separateUUIDParam } from '~/lib/utils';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { ROUTE as HELP_ROUTE } from '~/pages/help/index.vue';
import { useUser } from '~/composables/VeoUser';

export default defineComponent({
  name: 'ObjectSchemaEditor',
  setup() {
    const { locale, t } = useI18n();
    const { $api } = useContext();
    const route = useRoute();
    const { roles } = useUser();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

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

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    // Layout stuff
    const pageWidths = ref([6, 6]);

    const creationDialogVisible = ref(true);
    const errorDialogVisible = ref(false);
    const translationDialogVisible = ref(false);
    const detailsDialogVisible = ref(false);

    const translations = reactive<IVeoTranslations['lang']>({});
    useFetch(async () => {
      const _translations = (await $api.translation.fetch([]))?.lang || {};
      Object.assign(translations, _translations);
    });
    const availableLanguages = computed(() => Object.keys(translations.value));

    const isContentCreator = computed(() => roles.value.includes('veo-content-creator'));

    const downloadButton = ref();

    const code = ref('');
    const schemaIsValid = ref<VeoSchemaValidatorValidationResult>({ valid: false, errors: [], warnings: [] });

    // Editor stuff
    const hideEmptyAspects = ref(false);
    const searchQuery = ref<string | undefined>(undefined);

    // Schema stuff
    const title = computed(() => objectSchemaHelper.value?.getTitle() || '');
    const description = computed(() => objectSchemaHelper.value?.getDescription() || '');

    const schemaSpecificTranslations = (): IVeoTranslations['lang'] => {
      const translationsToReturn: IVeoTranslations['lang'] = {};
      const schemaTitle = objectSchemaHelper.value?.getTitle() || '';

      for (const language of availableLanguages.value) {
        translationsToReturn[language] = pickBy(translations[language], (_value, key) => key.startsWith(schemaTitle));
      }

      return translationsToReturn;
    };

    const setSchema = (data: { schema?: IVeoObjectSchema; meta: { type: string; description: string } }) => {
      objectSchemaHelper.value = data.schema || data.meta ? new ObjectSchemaHelper(data.schema, domainId.value) : undefined;

      if (objectSchemaHelper.value) {
        if (data.meta) {
          objectSchemaHelper.value.setTitle(data.meta.type);
          objectSchemaHelper.value.setDescription(data.meta.description);
        }

        if (objectSchemaHelper.value.getLanguages().length === 0) {
          for (const [languageKey, translations] of Object.entries(schemaSpecificTranslations)) {
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

    const downloadSchema = () => {
      if (downloadButton.value) {
        const data: string = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(objectSchemaHelper.value?.toSchema(), undefined, 2))}`;
        (downloadButton.value as any).href = data;
        (downloadButton.value as any).download = `os_${objectSchemaHelper.value?.getTitle() || 'download'}.json`;
      }
    };

    const validate = () => {
      schemaIsValid.value = objectSchemaHelper.value?.validate() || { valid: false, errors: [], warnings: [] };
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

    const saveSchema = async () => {
      try {
        await $api.domain.updateTypeDefinition(domainId.value, title.value, objectSchemaHelper.value?.toSchema() as any);
        displaySuccessMessage(t('saveSchemaSuccess').toString());
      } catch (e: any) {
        displayErrorMessage(t('error.title').toString(), `${t('saveSchemaError').toString()}: ${e.message}`);
      }
    };

    return {
      availableLanguages,
      code,
      creationDialogVisible,
      description,
      detailsDialogVisible,
      displayLanguage,
      domainId,
      downloadButton,
      downloadSchema,
      errorDialogVisible,
      hideEmptyAspects,
      isContentCreator,
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
      updateCode,
      updateSchema,
      updateSchemaName,
      updateDescription,

      t,
      upperFirst,
      mdiAlertCircleOutline,
      mdiContentSave,
      mdiDownload,
      mdiHelpCircleOutline,
      mdiInformationOutline,
      mdiMagnify,
      mdiTranslate,
      mdiWrench,
      HELP_ROUTE
    };
  }
});
</script>

<i18n>
{
  "en": {
    "description": "Description",
    "hideemptyaspects": "Hide empty aspects",
    "objectschema": "Object schema",
    "invalidObjectSchema":
      "Couldn't load schema. Please resolve the following errors and try again.",
    "search": "Search for a property",
    "translations": "Translations",
    "help": "Help",
    "save": "save",
    "saveSchemaSuccess": "Schema saved!",
    "saveSchemaError": "Couldn't save schema!",
    "saveContentCreator": "You need the role \"Content Creator\" to save the objectschema."
  },
  "de": {
    "description": "Beschreibung",
    "hideemptyaspects": "Leere Aspekte ausblenden",
    "objectschema": "Objektschema",
    "invalidObjectSchema":
      "Das Schema konnte nicht geladen werden. Bitte beheben Sie die Fehler und versuchen Sie es erneut.",
    "search": "Nach einer Eigenschaft suchen...",
    "translations": "Übersetzungen",
    "help": "Hilfe",
    "save": "speichern",
    "saveSchemaSuccess": "Schema wurde gespeichert!",
    "saveSchemaError": "Schema konnte nicht gespeichert werden",
    "saveContentCreator": "Sie müssen die Rolle \"Content Creator\" besitzen, um das Objektschema zu speichern."
  }
}
</i18n>

<style lang="scss" scoped>
.ose__code-editor {
  height: 100%;
}
</style>
