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
    class="veo-page-wrapper-white"
    collapsable-right
    :page-widths="pageWidths"
    @page-collapsed="onPageCollapsed"
  >
    <template #default>
      <VeoPage
        v-if="objectSchemaHelper"
        color="#ffffff"
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
                <span v-if="isContentCreator">{{ upperFirst(t('save')) }}</span>
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
                v-model="search"
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
            :search="search"
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
import Vue from 'vue';
import { computed } from '@nuxtjs/composition-api';
import { upperFirst, pickBy } from 'lodash';
import { mdiAlertCircleOutline, mdiContentSave, mdiDownload, mdiHelpCircleOutline, mdiInformationOutline, mdiMagnify, mdiTranslate, mdiWrench } from '@mdi/js';

import { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';
import ObjectSchemaHelper from '~/lib/ObjectSchemaHelper2';
import { IVeoObjectSchema, IVeoTranslations } from '~/types/VeoTypes';
import { separateUUIDParam } from '~/lib/utils';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { ROUTE as HELP_ROUTE } from '~/pages/help/index.vue';

const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

export default Vue.extend({
  name: 'ObjectSchemaEditor',
  provide(): any {
    return {
      displayLanguage: computed(() => this.displayLanguage),
      objectSchemaHelper: computed(() => this.objectSchemaHelper)
    };
  },
  data() {
    return {
      pageWidths: [6, 6] as number[],
      creationDialogVisible: false as boolean,
      errorDialogVisible: false as boolean,
      translationDialogVisible: false as boolean,
      translations: {} as IVeoTranslations['lang'],
      detailsDialogVisible: false as boolean,
      hideEmptyAspects: false as boolean,
      search: '' as string,
      objectSchemaHelper: undefined as ObjectSchemaHelper | undefined,
      code: '' as string,
      schemaIsValid: { valid: false, errors: [], warnings: [] } as VeoSchemaValidatorValidationResult,
      displayLanguage: this.$i18n.locale as string,
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
  },
  async fetch() {
    // TODO: Backend should create an API endpoint to get available languages dynamically
    this.translations = (await this.$api.translation.fetch([]))?.lang || {};
  },
  head(): any {
    return {
      title: this.$t('editor.objectschema.headline')
    };
  },
  computed: {
    title(): string {
      return this.objectSchemaHelper?.getTitle() || '';
    },
    description(): string {
      return this.objectSchemaHelper?.getDescription() || '';
    },
    domainId(): string {
      return separateUUIDParam(this.$route.params.domain).id;
    },
    availableLanguages(): string[] {
      return Object.keys(this.translations);
    },
    schemaSpecificTranslations(): IVeoTranslations['lang'] {
      const translationsToReturn: IVeoTranslations['lang'] = {};
      const schemaTitle = this.objectSchemaHelper?.getTitle() || '';

      for (const language of this.availableLanguages) {
        translationsToReturn[language] = pickBy(this.translations[language], (_value, key) => key.startsWith(schemaTitle));
      }

      return translationsToReturn;
    },
    isContentCreator(): boolean {
      return !!this.$user.auth.roles.find((r: string) => r === 'veo-content-creator');
    }
  },
  watch: {
    '$i18n.locale'(newValue) {
      this.displayLanguage = newValue;
    }
  },
  mounted() {
    this.creationDialogVisible = true;
  },
  methods: {
    setSchema(data: { schema?: IVeoObjectSchema; meta: { type: string; description: string } }) {
      this.objectSchemaHelper = data.schema || data.meta ? new ObjectSchemaHelper(data.schema, this.domainId) : undefined;

      if (this.objectSchemaHelper) {
        if (data.meta) {
          this.objectSchemaHelper.setTitle(data.meta.type);
          this.objectSchemaHelper.setDescription(data.meta.description);
        }

        if (this.objectSchemaHelper.getLanguages().length === 0) {
          for (const [languageKey, translations] of Object.entries(this.schemaSpecificTranslations)) {
            this.objectSchemaHelper.updateTranslations(languageKey, translations);
          }
        }
        this.code = JSON.stringify(this.objectSchemaHelper.toSchema(), undefined, 2);
        this.validate();
      }

      this.creationDialogVisible = !this.objectSchemaHelper || false;
    },
    updateSchema(schema: IVeoObjectSchema) {
      this.objectSchemaHelper = new ObjectSchemaHelper(schema);
      this.code = JSON.stringify(this.objectSchemaHelper.toSchema(), undefined, 2);
      this.objectSchemaHelper = new ObjectSchemaHelper(JSON.parse(this.code));

      this.validate();
    },
    updateSchemaName(name: string) {
      this.objectSchemaHelper?.setTitle(name);
      this.code = JSON.stringify(this.objectSchemaHelper?.toSchema(), undefined, 2);
    },
    updateDescription(description: string) {
      this.objectSchemaHelper?.setDescription(description);
      this.code = JSON.stringify(this.objectSchemaHelper?.toSchema(), undefined, 2);
    },
    updateCode() {
      if (this.objectSchemaHelper) {
        this.code = JSON.stringify(this.objectSchemaHelper.toSchema(), undefined, 2);
        this.validate();
      }
    },
    downloadSchema() {
      if (this.$refs.downloadButton) {
        const data: string = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.objectSchemaHelper?.toSchema(), undefined, 2))}`;
        (this.$refs.downloadButton as any).href = data;
        (this.$refs.downloadButton as any).download = `os_${this.objectSchemaHelper?.getTitle() || 'download'}.json`;
      }
    },
    validate() {
      this.schemaIsValid = this.objectSchemaHelper?.validate() || { valid: false, errors: [], warnings: [] };
    },
    onDisplayLanguageUpdate(newLanguage: string) {
      this.displayLanguage = newLanguage;
    },
    onPageCollapsed(collapsedPages: boolean[]) {
      if (collapsedPages[1]) {
        this.pageWidths = [12, 0];
      } else {
        this.pageWidths = [6, 6];
      }
    },
    async saveSchema() {
      try {
        await this.$api.domain.updateTypeDefinition(this.domainId, this.title, this.objectSchemaHelper?.toSchema());
        displaySuccessMessage(this.$t('saveSchemaSuccess'));
      } catch (e: any) {
        displayErrorMessage(this.$t('error.title'), this.$t('saveSchemaError').toString() + e.message);
      }
    },
    upperFirst
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
    "saveSchemaError": "Schema konnte nicht gespeichert werden!",
    "saveContentCreator": "Sie müssen die Rolle \"Content Creator\" besitzen, um das Objektschema zu speichern."
  }
}
</i18n>

<style lang="scss" scoped>
.ose__code-editor {
  height: 100%;
}
</style>
