<template>
  <VeoDialog :value="value" large :headline="$t('editor.formschema.formschema')" @input="onDialogStatus">
    <template #default>
      <div style="min-height: 20vh">
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">Wählen Sie Primärsprache aus*:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-autocomplete v-model="dialog.primaryLanguage" :items="languageItems" label="Primärsprache" required />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center mt-4">
          <v-col :cols="12" :md="5">
            <span style="font-size: 1.2rem;">Unterstütze Sprachen*:</span>
          </v-col>
          <v-col :cols="12" :md="5">
            <v-autocomplete v-model="dialog.languages" :items="languageItems" multiple label="Sprachen" required />
          </v-col>
        </v-row>

        <v-row>
          <v-col v-for="item in translationAsCode" :key="item.name">
            <v-card outlined>
              <v-card-title>{{ item.fullName }}</v-card-title>
              <v-card-text>
                <CodeEditor :key="item.name" :value="item.code" />
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
import { IVEOFormSchemaTranslationCollection } from 'veo-formschema'
import Vue from 'vue'
import VeoDialog from '~/components/dialogs/VeoDialog.vue'

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
    }
  },
  data() {
    return {
      dialog: {
        translation: {} as IVEOFormSchemaTranslationCollection,
        primaryLanguage: 'de',
        languages: ['de']
      },
      languageItems: [
        { text: 'Deutsch', value: 'de' },
        { text: 'Englisch', value: 'en' },
        { text: 'Französisch', value: 'fr' },
        { text: 'Tschechisch', value: 'cz' }
      ],
      languageFullName: { de: 'Deutsch', en: 'Englisch' } as any
    }
  },
  computed: {
    translationAsCode(): any {
      return Object.keys(this.dialog.translation).map((translationName: string) => ({
        name: translationName,
        fullName: this.languageFullName[translationName],
        code: JSON.stringify(this.dialog.translation[translationName], undefined, 2)
      }))
      // return JSON.stringify(this.dialog.translation, undefined, 2)
    }
    // translationAsCode: {
    //   get(): string {
    //     return this.dialog.translation ? JSON.stringify(this.dialog.translation, undefined, 2) : ''
    //   },
    //   set(v: string) {
    //     try {
    //       this.$emit('update:translation', JSON.parse(v))
    //     } catch (e) {}
    //   }
    // }
  },
  methods: {
    onDialogStatus(event: boolean) {
      this.$emit('input', event)
    },
    onSave() {
      this.onDialogStatus(false)
    }
  },
  created() {
    this.dialog.translation = this.translation
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

::v-deep .veo-editor-save-button {
  display: none;
}
</style>
