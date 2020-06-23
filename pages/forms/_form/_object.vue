<template>
  <div>
    <template v-if="$fetchState.pending">
      <div class="text-center ma-12">
        <v-progress-circular indeterminate color="primary" size="50" />
      </div>
    </template>

    <template v-else>
      <div class="d-flex flex-row">
        <div class="d-flex flex-column flex-grow-1 pa-6">
          <div class="text-center my-6">
            <v-btn dark class="ma-1" @click="activeLanguage = 'en'">English</v-btn>
            <v-btn dark class="ma-1" @click="activeLanguage = 'de'">Deutsch</v-btn>
          </div>
          <veo-form v-if="!$fetchState.pending" v-model="form.value" :schema="form.objectSchema" :ui="form.formSchema" :lang="form.lang[activeLanguage]" />
        </div>
      </div>

      <div class="d-flex flex-row">
        <div class="d-flex flex-column flex-grow-1 pa-6">
          <div class="mx-auto" style="width:800px">
            <v-expansion-panels v-model="panel">
              <v-expansion-panel>
                <v-expansion-panel-header>Generated Data</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <code>
                    <pre>{{ JSON.stringify(form.value, null, 4) }}</pre>
                  </code>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </div>
      </div>

      <div class="d-flex flex-row">
        <div class="d-flex flex-column flex-grow-1 pa-6">
          <div class="mx-auto" style="width:800px">
            <v-btn color="primary" block @click="save">Speichern</v-btn>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { preprocessSchemaForTranslation, IForm } from '@/lib/utils'

interface IData {
  panel: boolean
  activeLanguage: string
  form: IForm
}

export default Vue.extend({
  name: 'Forms',
  async fetch() {
    // TODO "process" muss überall ersetzt werden durch das Objekt, welches im formSchema als ziel Objekt vorgegeben wird
    const objectSchema = preprocessSchemaForTranslation(await this.$api.schema.fetch('process'))
    // const translation = await context.app.$api.translation.fetch(['de', 'en'])
    const formSchema = await require(`./${this.$route.params.form}.json`)
    const { lang } = await require('./../Translations.json')
    const value = await this.$api.process.fetch(this.$route.params.object)
    this.form = {
      objectSchema,
      formSchema,
      value,
      lang
    }
  },
  data(): IData {
    return {
      panel: true,
      activeLanguage: 'de',
      form: {
        objectSchema: {},
        formSchema: {},
        value: {},
        lang: {}
      }
    }
  },
  methods: {
    async save() {
      try {
        // TODO: find better solution
        //  Add Keys and IDs manually
        Object.keys(this.form.value.customAspects).forEach((key: string) => {
          this.form.value.customAspects[key] = { ...this.form.value.customAspects[key], id: '00000000-0000-0000-0000-000000000000', type: key }
        })
        // this.value.customAspects = {}
        console.log(this.form.value)
        await this.$api.process.update(this.$route.params.object, this.form.value)
      } catch (e) {
        console.error(e)
      }
    }
  },
  head() {
    return {
      title: 'Form'
    }
  }
})
</script>

<style lang="scss" scoped>
code {
  padding: 20px;
  width: 100%;
}
</style>
