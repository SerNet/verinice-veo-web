<template>
  <VeoDialog v-model="dialog" large :headline="$t('editor.formschema.translation')">
    <template #default>
      <div style="min-height: 20vh">
        <v-form v-model="data.valid">
          <v-row no-gutters class="align-center mt-4">
            <v-col :cols="12" :md="5">
              <span style="font-size: 1.2rem;"
                >{{ $t('displayLanguageDescription') }}*:</span
              >
            </v-col>
            <v-col :cols="12" :md="5">
              <v-autocomplete
                v-model="data.displayLanguage"
                :items="supportedLanguageItems"
                :rules="requiredRule"
                :label="$t('displayLanguage')"
                required
              />
            </v-col>
          </v-row>
          <v-row no-gutters class="align-center mt-4">
            <v-col :cols="12" :md="5">
              <span style="font-size: 1.2rem;"
                >{{ $t('supportedLanguages') }}*:</span
              >
            </v-col>
            <v-col :cols="12" :md="5">
              <v-autocomplete
                v-model="data.supportedLanguages"
                :items="availableLanguageItems"
                :rules="requiredRule"
                multiple
                :label="$t('supportedLanguages')"
                required
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col v-for="language in data.supportedLanguages" :key="language" :cols="12">
              <v-card outlined>
                <v-card-title>{{ $t(`languageName.${ language }`) }}</v-card-title>
                <v-card-text>
                  <VeoCodeEditor :value="JSON.stringify(data.translations[language], undefined, 2)" @input="onCodeUpdate($event, language)" />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
        <small>{{ $t('global.input.requiredfields') }}</small>
      </div>
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="$emit('input', false)">
        {{ $t('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn text color="primary" :disabled="!data.valid" @click="onSave">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import ObjectSchemaHelper from '~/lib/ObjectSchemaHelper2'
import { IVeoTranslationCollection } from '~/types/VeoTypes'

interface IItem {
  value: string
  text: string
}

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    objectSchemaHelper: {
      type: ObjectSchemaHelper,
      required: true
    },
    availableLanguages: {
      type: Array as Prop<string[]>,
      default: () => []
    },
    currentDisplayLanguage: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      data: {
        valid: true,
        translations: {} as { [key: string]: IVeoTranslationCollection },
        displayLanguage: '' as string,
        supportedLanguages: [] as string[]
      }
    }
  },
  computed: {
    dialog: {
      get(): boolean {
        return this.value
      },
      set(newValue: boolean) {
        this.$emit('input', newValue)
      }
    },
    availableLanguageItems(): IItem[] {
      return this.availableLanguages.map((language: string) => ({
        text: this.$t(`languageName.${ language }`).toString(),
        value: language
      }))
    },
    supportedLanguageItems(): IItem[] {
      return this.data.supportedLanguages.map((language: string) => ({
        text: this.$t(`languageName.${ language }`).toString(),
        value: language
      }))
    },
    requiredRule() {
      return [(v: any) => (Array.isArray(v) ? v.length > 0 : !!v)]
    }
  },
  watch: {
    'data.supportedLanguages'(newValue: string[]) {
      // Make sure all supported languages contain an entry in the translations object.
      for (let language of newValue) {
        if (!this.data.translations[language]) {
          const savedTranslations = this.objectSchemaHelper.getTranslations(language)
          if (savedTranslations) {
            this.data.translations[language] = savedTranslations
          } else {
            this.data.translations[language] = {}
          }
        }
      }

      // Remove all no longer supported languages from the translations object.
      for (let language of Object.keys(this.data.translations)) {
        if (!newValue.includes(language)) {
          delete this.data.translations[language]
        }
      }

      // If the current display language has been removed, set the first one as a fallback.
      if (!newValue.includes(this.data.displayLanguage)) {
        if (newValue.length > 0) {
          this.data.displayLanguage = newValue[0]
        } else {
          this.data.displayLanguage = ''
        }
      }
    },
    'data.displayLanguage'(newValue: string) {
      this.$emit('display-language-changed', newValue)
    },
    currentDisplayLanguage(newValue: string, oldValue: string) {
      if (newValue !== oldValue) {
        this.data.displayLanguage = newValue
      }
    }
  },
  methods: {
    onSave() {
      for(const [language, translations] of Object.entries(this.data.translations)) {
        this.objectSchemaHelper.updateTranslations(language, translations)
      }

      this.$emit('input', false)
      this.$emit('schema-updated')
    },
    onCodeUpdate(payload: any, language: string) {
      try {
        this.data.translations[language] = JSON.parse(payload)
      } catch (e) {}
    }
  },
  mounted() {
    this.data.supportedLanguages = this.objectSchemaHelper.getLanguages()
    this.data.displayLanguage = this.currentDisplayLanguage
    this.data.translations = this.objectSchemaHelper.getAllTranslations()

  }
})
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
    "displayLanguageDescription": "Display language in object schema editor",
    "supportedLanguages": "Supported Languages"
  },
  "de": {
    "languageName": {
      "de": "Deutsch",
      "en": "Englisch",
      "it": "Italienisch",
      "cs": "Tschechisch"
    },
    "displayLanguage": "Sprache",
    "displayLanguageDescription": "Anzeigesprache im Objektschema Editor",
    "supportedLanguages": "Sprachen"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

::v-deep .veo-editor-save-button {
  display: none;
}
</style>
