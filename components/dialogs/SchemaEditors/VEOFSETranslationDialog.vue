<template>
  <VeoDialog :value="value" large :headline="$t('editor.formschema.translation')" @input="onDialogStatus">
    <template #default>
      <div style="min-height: 20vh">
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"
              >{{ $t('editor.formschema.translation.edit.language.input.label.text') }}*:</span
            >
          </v-col>
          <v-col :cols="12" :md="5">
            <v-autocomplete
              v-model="dialog.language"
              :items="languageItems"
              :label="$t('editor.formschema.translation.edit.language.input.label')"
              required
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;"
              >{{ $t('editor.formschema.translation.edit.supportedlanguages.input.label.text') }}*:</span
            >
          </v-col>
          <v-col :cols="12" :md="5">
            <v-autocomplete
              :value="dialog.languages"
              :items="languageItems"
              multiple
              :label="$t('editor.formschema.translation.edit.supportedlanguages.input.label')"
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
      </div>
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="onDialogStatus(false)">
        {{ $t('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn text color="primary" @click="onSave">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { isEmpty } from 'lodash'
import Vue from 'vue'
import VeoDialog from '~/components/dialogs/VeoDialog.vue'

interface ITranslationItem {
  name: string
  fullName: string
  code: string
}

interface ITranslationCollection {
  [key: string]: string
}

export default Vue.extend({
  components: {
    VeoDialog
  },
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
        translation: {} as ITranslationCollection,
        language: '' as string,
        languages: [] as string[]
      },
      emptyObjectString: '{\n  \n}'
    }
  },
  computed: {
    languageItems() {
      return (this.languages as string[]).map((languageCode: string) => ({
        value: languageCode,
        text: this.$t(`editor.formschema.translation.language.fullname.${languageCode}`)
      }))
    },
    translationAsCode(): ITranslationItem[] {
      return this.dialog.languages.map((languageCode: string) => ({
        name: languageCode,
        fullName: this.languageItems.find(languageItem => languageItem.value === languageCode)?.text as string,
        code: this.dialog.translation[languageCode]
      }))
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
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

::v-deep .veo-editor-save-button {
  display: none;
}
</style>
