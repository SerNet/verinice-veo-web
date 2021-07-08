<template>
  <VeoDialog
    :value="value"
    large
    :headline="$t('editor.formschema.translation')"
    @input="onDialogStatus"
  >
    <template #default>
      <div style="min-height: 20vh">
        <v-form v-model="dialog.valid">
          <v-row
            no-gutters
            class="align-center mt-4"
          >
            <v-col
              :cols="12"
              :md="5"
            >
              <span
                style="font-size: 1.2rem;"
              >{{ $t('displayLanguageDescription') }}*:</span>
            </v-col>
            <v-col
              :cols="12"
              :md="5"
            >
              <v-select
                v-model="dialog.language"
                :items="supportedLanguages"
                :rules="requiredRule"
                :label="$t('displayLanguage')"
                required
              />
            </v-col>
          </v-row>
          <v-row
            no-gutters
            class="align-center mt-4"
          >
            <v-col
              :cols="12"
              :md="5"
            >
              <span
                style="font-size: 1.2rem;"
              >{{ $t('supportedLanguages') }}*:</span>
            </v-col>
            <v-col
              :cols="12"
              :md="5"
            >
              <v-select
                :value="dialog.languages"
                :items="languageItems"
                :rules="requiredRule"
                multiple
                :label="$t('supportedLanguages')"
                required
                @input="onInputLanguages"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col
              v-for="item in translationAsCode"
              :key="item.name"
              :cols="12"
            >
              <v-card
                :key="item.name"
                outlined
              >
                <v-card-title>{{ item.fullName }}</v-card-title>
                <v-card-text>
                  <v-row no-gutters>
                    <v-col
                      :cols="12"
                      :md="5"
                    >
                      <v-text-field
                        v-model="dialog.name[item.name]"
                        flat
                        :label="$t('schemaName')"
                      />
                    </v-col>
                  </v-row>

                  <VeoCodeEditor
                    :key="item.name"
                    ref="codeEditor"
                    :value="item.code"
                    @input="onInputCode($event, item)"
                  />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
        <small>{{ $t('global.input.requiredfields') }}</small>
      </div>
    </template>
    <template #dialog-options>
      <v-btn
        text
        color="primary"
        @click="onDialogStatus(false)"
      >
        {{ $t('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!dialog.valid"
        @click="onSave"
      >
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { cloneDeep, difference, isEmpty } from 'lodash';
import Vue from 'vue';
import vjp from 'vue-json-pointer';

import { IVeoFormSchemaMeta, IVeoTranslationCollection } from '~/types/VeoTypes';

interface ITranslationItem {
  name: string;
  fullName: string;
  code: string;
}

interface IItem {
  value: string;
  text: string;
}

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    translation: {
      type: Object,
      required: true
    },
    language: {
      type: String,
      required: true
    },
    languages: {
      type: Array,
      required: true
    },
    name: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialog: {
        valid: true,
        translation: {} as IVeoTranslationCollection,
        language: '' as string,
        languages: [] as string[],
        name: {} as IVeoFormSchemaMeta['name']
      },
      emptyObjectString: '{\n  \n}'
    };
  },
  computed: {
    languageItems(): IItem[] {
      return (this.languages as string[]).map((languageCode: string) => ({
        value: languageCode,
        text: this.$t(`languageName.${languageCode}`) as string
      }));
    },
    supportedLanguages(): IItem[] {
      return this.dialog.languages.map((language: string) => this.languageItems.find((item) => item.value === language) as IItem);
    },
    translationAsCode(): ITranslationItem[] {
      return this.dialog.languages.map((languageCode: string) => ({
        name: languageCode,
        fullName: this.languageItems.find((languageItem) => languageItem.value === languageCode)?.text as string,
        code: this.dialog.translation[languageCode]
      }));
    },
    requiredRule() {
      return [(v: any) => (Array.isArray(v) ? v.length > 0 : !!v)];
    }
  },
  watch: {
    translation: {
      immediate: true,
      deep: true,
      handler() {
        this.dialog.translation = Object.fromEntries(
          Object.entries(this.translation).map(([key, value]) => [key, !isEmpty(value) ? JSON.stringify(value, null, 2) : this.emptyObjectString])
        );
        this.dialog.languages = Object.keys(this.translation);
      }
    },
    language: {
      immediate: true,
      handler() {
        this.dialog.language = this.language;
      }
    },
    name: {
      immediate: true,
      deep: true,
      handler() {
        this.dialog.name = cloneDeep(this.name);
      }
    }
  },
  methods: {
    onDialogStatus(event: boolean) {
      this.$emit('input', event);
    },
    onSave() {
      const translationJSON = Object.fromEntries(
        Object.entries(this.dialog.translation)
          .filter(([key, _]) => this.dialog.languages.includes(key))
          .map(([key, value]) => [key, JSON.parse(value as string)])
      );
      this.$emit('update-language', this.dialog.language);
      this.$emit('update-translation', translationJSON);
      this.$emit('update-name', this.dialog.name);
      this.onDialogStatus(false);
    },
    onInputCode(event: any, item: ITranslationItem) {
      this.dialog.translation[item.name] = event;
    },
    onInputLanguages(event: string[]) {
      const removedLanguageCodes = difference(this.dialog.languages, event);
      this.dialog.languages = event;
      event.forEach((languageCode) => {
        if (isEmpty(this.dialog.translation[languageCode])) {
          this.dialog.translation[languageCode] = this.emptyObjectString;
        }
      });
      // If currently selected display language is not in the languages array, remove the variable dialog.language
      if (!this.dialog.languages.includes(this.dialog.language)) {
        this.dialog.language = '';
      }
      // If a language code has been removed, removed it from formschema name
      removedLanguageCodes.forEach((removedLanguageCode) => {
        vjp.remove(this.dialog.name, `/${removedLanguageCode}`);
      });
    }
  }
});
</script>

<i18n>
{
  "en": {
    "languageName": {
      "de": "German",
      "en": "English",
      "it": "Italian",
      "cs": "Czech"
    },
    "languageSelectLabel": "Language",
    "displayLanguage": "Languages",
    "displayLanguageDescription": "Display language in form schema editor",
    "supportedLanguages": "Supported Languages",
    "schemaName": "Name of the form schema"
  },
  "de": {
    "languageName": {
      "de": "Deutsch",
      "en": "Englisch",
      "it": "Italienisch",
      "cs": "Tschechisch"
    },
    "displayLanguage": "Sprache",
    "displayLanguageDescription": "Anzeigesprache im Formschema Editor",
    "supportedLanguages": "Sprachen",
    "schemaName": "Name des Formschemas"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

::v-deep .veo-editor-save-button {
  display: none;
}
</style>
