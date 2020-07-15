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

          <div class="mx-auto pa-3" style="width:800px">
            <div class="display-1">{{ form.value.name }}</div>
          </div>

          <veo-form v-if="!$fetchState.pending" v-model="form.value" :schema="form.objectSchema" :ui="form.formSchema.content" :lang="form.lang && form.lang[activeLanguage]" />
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
            <v-btn color="primary" :loading="state === 'loading'" block @click="save">Speichern</v-btn>
            <AppStateAlert v-model="state" state-after-alert="start" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { IForm } from '@/lib/utils'
import AppStateAlert from '@/components/AppStateAlert.vue'

interface IData {
  panel: boolean
  activeLanguage: string
  objectType: string
  form: IForm
  state: string
}

export default Vue.extend({
  name: 'Forms',
  components: {
    AppStateAlert
  },
  async fetch() {
    const formSchema = await this.$api.form.fetch(this.$route.params.form)
    this.objectType = formSchema.modelType.toLowerCase()
    const objectSchema = await this.$api.schema.fetch(this.objectType)
    const { lang } = await this.$api.translation.fetch(['de', 'en'])
    const value = await this.$api[this.objectType].fetch(this.$route.params.object)
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
      objectType: '',
      form: {
        objectSchema: {},
        formSchema: {},
        value: {},
        lang: {}
      },
      state: 'start'
    }
  },
  watch: {
    '$route.params': '$fetch'
  },
  methods: {
    async save() {
      this.state = 'loading'
      try {
        // TODO: find better solution
        //  Add Keys and IDs manually
        Object.keys(this.form.value.customAspects).forEach((key: string) => {
          this.form.value.customAspects[key] = { ...this.form.value.customAspects[key], id: '00000000-0000-0000-0000-000000000000', type: key }
        })
        await this.$api[this.objectType].update(this.$route.params.object, this.form.value)
        this.state = 'success'
      } catch (e) {
        this.state = 'error'
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
  padding: 0;
  width: 100%;
  display: block;
}
</style>
