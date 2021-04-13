<template>
  <VeoDialog :value="value" large :headline="$t('editor.formschema.translation')" @input="onDialogStatus">
    <template #default>
      <div style="min-height: 20vh">
        <v-form v-model="dialog.valid">
          <v-row no-gutters class="align-center mt-4">
            <v-col :cols="12" :md="5">
              <span style="font-size: 1.2rem;"
                >{{ $t('language.input.label_description') }}*:</span
              >
            </v-col>
            <v-col :cols="12" :md="5">
              <v-autocomplete
                v-model="dialog.language"
                :items="supportedLanguages"
                :rules="requiredRule"
                :label="$t('language.input.label')"
                required
              />
            </v-col>
          </v-row>
          <v-row no-gutters class="align-center mt-4">
            <v-col :cols="12" :md="5">
              <span style="font-size: 1.2rem;"
                >{{ $t('supportedlanguages.input.label_description') }}*:</span
              >
            </v-col>
            <v-col :cols="12" :md="5">
              <v-autocomplete
                :value="dialog.languages"
                :items="languageItems"
                :rules="requiredRule"
                multiple
                :label="$t('supportedlanguages.input.label')"
                required
                @input="onInputLanguages"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col v-for="item in translationAsCode" :key="item.name" :cols="12">
              <v-card outlined :key="item.name">
                <v-card-title>{{ item.fullName }}</v-card-title>
                <v-card-text>
                  <CodeEditor :key="item.name" :value="item.code" ref="codeEditor" @input="onInputCode($event, item)" />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
        <small>{{ $t('global.input.requiredfields') }}</small>
      </div>
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="onDialogStatus(false)">
        {{ $t('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn text color="primary" :disabled="!dialog.valid" @click="onSave">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { isEmpty } from 'lodash'
import Vue from 'vue'

interface ITranslationItem {
  name: string
  fullName: string
  code: string
}

interface ITranslationCollection {
  [key: string]: string
}

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
    }
  },
  data() {
    return {
      dialog: {
        valid: true,
        translation: {} as ITranslationCollection,
        language: '' as string,
        languages: [] as string[]
      },
      emptyObjectString: '{\n  \n}'
    }
  },
  computed: {
    languageItems(): IItem[] {
      return (this.languages as string[]).map((languageCode: string) => ({
        value: languageCode,
        text: this.$t(`language.fullname.${languageCode}`) as string
      }))
    },
    supportedLanguages(): IItem[] {
      return this.dialog.languages.map(
        (language: string) => this.languageItems.find(item => item.value === language) as IItem
      )
    },
    translationAsCode(): ITranslationItem[] {
      return this.dialog.languages.map((languageCode: string) => ({
        name: languageCode,
        fullName: this.languageItems.find(languageItem => languageItem.value === languageCode)?.text as string,
        code: this.dialog.translation[languageCode]
      }))
    },
    requiredRule() {
      return [(v: any) => (Array.isArray(v) ? v.length > 0 : !!v)]
    }
  },
  watch: {
    translation: {
      immediate: true,
      deep: true,
      handler() {
        this.dialog.translation = Object.fromEntries(
          Object.entries(this.translation).map(([key, value]) => [
            key,
            !isEmpty(value) ? JSON.stringify(value, null, 2) : this.emptyObjectString
          ])
        )
        this.dialog.languages = Object.keys(this.translation)
      }
    },
    language: {
      immediate: true,
      handler() {
        this.dialog.language = this.language
      }
    }
  },
  methods: {
    onDialogStatus(event: boolean) {
      this.$emit('input', event)
    },
    onSave() {
      const translationJSON = Object.fromEntries(
        Object.entries(this.dialog.translation)
          .filter(([key, value]) => this.dialog.languages.includes(key))
          .map(([key, value]) => [key, JSON.parse(value as string)])
      )
      this.$emit('update-language', this.dialog.language)
      this.$emit('update-translation', translationJSON)
      this.onDialogStatus(false)
    },
    onInputCode(event: any, item: ITranslationItem) {
      this.dialog.translation[item.name] = event
    },
    onInputLanguages(event: string[]) {
      this.dialog.languages = event
      event.forEach(languageCode => {
        if (isEmpty(this.dialog.translation[languageCode])) {
          this.dialog.translation[languageCode] = this.emptyObjectString
        }
      })
      // If currently selected display language is not in the languages array, remove the variable dialog.language
      if (!this.dialog.languages.includes(this.dialog.language)) {
        this.dialog.language = ''
      }
    }
  }
})
</script>

<i18n>
{
  "en": {
    "language.fullname.de": "German",
    "language.fullname.en": "English",
    "language.fullname.it": "Italian",
    "language.fullname.cs": "Czech",
    "language.input.label": "Language",
    "language.input.label_description": "Display language in form schema editor",
    "supportedlanguages.input.label": "Languages",
    "supportedlanguages.input.label_description": "Supported Languages"
  },
  "de": {
    "language.fullname.de": "Deutsch",
    "language.fullname.en": "Englisch",
    "language.fullname.it": "Italienisch",
    "language.fullname.cs": "Tschechisch",
    "language.input.label": "Sprache",
    "language.input.label_description": "Anzeigesprache im Formschema Editor",
    "supportedlanguages.input.label": "Sprachen",
    "supportedlanguages.input.label_description": "Unterstützte Sprachen"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

::v-deep .veo-editor-save-button {
  display: none;
}
</style>
