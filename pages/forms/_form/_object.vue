<template>
  <div>
    <div class="d-flex flex-row">
      <div class="d-flex flex-column flex-grow-1 pa-6">
        <div class="text-center my-6">
          <v-btn dark class="ma-1" @click="activeLanguage = 'en'">English</v-btn>
          <v-btn dark class="ma-1" @click="activeLanguage = 'de'">Deutsch</v-btn>
        </div>
        <veo-form v-model="value" :schema="objectSchema" :ui="formSchema" :lang="lang[activeLanguage]" />
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
                  <pre>{{ JSON.stringify(value, null, 4) }}</pre>
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import JsonPointer from 'json-ptr'

const preprocessSchemaForTranslation = (schema: any) => {
  schema.$schema = 'http://json-schema.org/draft-07/schema#'
  JsonPointer.list(schema, '#')
    .filter((obj: any) => /\/(?<!type\/)enum\/\d+$/gi.test(obj.fragmentId))
    .forEach((obj: any) => {
      JsonPointer.set(schema, obj.fragmentId, `#lang/${obj.value}`)
    })
  return schema
}

export default Vue.extend({
  name: 'Forms',
  async asyncData({ app, params }) {
    // TODO "process" muss überall ersetzt werden durch das Objekt, welches im formSchema als ziel Objekt vorgegeben wird
    const objectSchema = preprocessSchemaForTranslation(await app.$api.schema.fetch('process'))
    // const translation = await context.app.$api.translation.fetch(['de', 'en'])
    const formSchema = await require(`./${params.form}.json`)
    const translation = await require('./../Translations.json')
    const value = await app.$api.process.fetch(params.object)
    return { objectSchema, formSchema, lang: translation.lang, value }
  },
  data() {
    return {
      panel: true,
      activeLanguage: 'de',
      value: undefined as any | undefined
    }
  },
  methods: {
    async save() {
      try {
        // TODO: find better solution
        //  Add Keys and IDs manually
        Object.keys(this.value.customAspects).forEach((key: string) => {
          this.value.customAspects[key] = { ...this.value.customAspects[key], id: '00000000-0000-0000-0000-000000000000', type: key }
        })
        // this.value.customAspects = {}
        console.log(this.value)
        await this.$api.process.update(this.$route.params.object, this.value)
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
