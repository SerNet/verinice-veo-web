<template>
  <v-col>
    <template v-if="$fetchState.pending">
      <div class="text-center ma-12">
        <v-progress-circular indeterminate color="primary" size="50" />
      </div>
    </template>

    <template v-else>
      <div class="mx-auto pa-3" style="max-width:800px; width:100%;">
        <div class="display-1">{{ form.objectData.name }}</div>
      </div>

      <VeoForm
        v-model="form.objectData"
        :schema="form.objectSchema"
        :ui="form.formSchema && form.formSchema.content"
        :lang="form.lang && form.lang[activeLanguage]"
        :api="dynamicAPI"
        :is-valid.sync="isValid"
        :error-messages.sync="errorMessages"
      />

      <div class="mx-auto pa-3" style="max-width:800px; width:100%;">
        <v-expansion-panels v-model="panel" hover focusable multiple class="mx-auto my-3">
          <v-expansion-panel>
            <v-expansion-panel-header>{{ $t('unit.data.objectdata') }}</v-expansion-panel-header>
            <v-expansion-panel-content style="overflow:auto">
              <pre>{{ JSON.stringify(form.objectData, null, 4) }}</pre>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>{{ $t('unit.data.validationlogs') }}</v-expansion-panel-header>
            <v-expansion-panel-content style="overflow:auto">
              <div>{{ $t('unit.data.valid') }}: {{ isValid }}</div>
              <div>{{ $t('unit.data.errormessages') }}:</div>
              <pre>{{ errorMessages }}</pre>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-btn color="primary" :loading="btnLoading" block @click="onClick">{{ $t('global.button.save') }}</v-btn>
        <AppStateAlert v-model="state" :error="error || $fetchState.error" state-after-alert="start" />
        <AppStateDialog v-if="error && error.status == 412" :value="!!error" title="Fehler" @input="error = undefined" @yes="$fetch">
          <template v-if="error">
            <span v-if="error && error.status == 412">{{ $t('unit.forms.nrr') }}</span>
            <span v-else v-text="error" />
          </template>
        </AppStateDialog>
      </div>
    </template>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { IForm } from '~/lib/utils'
import AppStateAlert from '~/components/AppStateAlert.vue'
import AppStateDialog from '~/components/AppStateDialog.vue'
import VeoForm from '~/components/forms/VeoForm.vue'

export enum ObjectSchemaNames {
  asset = 'asset',
  control = 'control',
  person = 'person',
  process = 'process'
}

export interface IValidationErrorMessage {
  pointer: string
  message: string
}

interface IData {
  panel: number[]
  activeLanguage: string
  objectType: ObjectSchemaNames | undefined
  form: IForm
  isValid: boolean
  errorMessages: IValidationErrorMessage[]
  state: string
  error?: Error & { status?: number },
  btnLoading: boolean
}

export default Vue.extend({
  name: 'VeoFormsObjectDataUpdate',
  components: {
    AppStateAlert,
    AppStateDialog,
    VeoForm
  },
  async fetch() {
    const formSchema = await this.$api.form.fetch(this.$route.params.form)
    this.objectType = formSchema.modelType && formSchema.modelType.toLowerCase()
    if (this.objectType && this.objectType in ObjectSchemaNames) {
      const objectSchema = await this.$api.schema.fetch(this.objectType)
      const objectData = this.$route.params.object ? await this.$api[this.objectType].fetch(this.$route.params.object) : {}
      const { lang } = await this.$api.translation.fetch(['de', 'en'])
      this.form = {
        objectSchema,
        formSchema,
        objectData,
        lang
      }
    } else {
      throw new Error('Object Type is not defined in FormSchema')
    }
  },
  data(): IData {
    return {
      panel: [],
      activeLanguage: 'de',
      objectType: undefined,
      form: {
        objectSchema: {},
        objectData: {},
        formSchema: undefined,
        lang: {}
      },
      isValid: true,
      errorMessages: [],
      state: 'start',
      error: undefined,
      btnLoading: false
    }
  },
  computed: {
    unit(): string {
      return this.$route.params.unit
    },
    dynamicAPI(): any {
      // TODO: adjust this dynamicAPI so that it provided directly by $api
      return {
        fetchAll: (objectType: string, searchParams?: any) => {
          return this.$api[objectType].fetchAll(searchParams)
        },
        create: async(objectType: string, createdObjectData: any) => {
          const res = await this.$api[objectType].create({
            ...createdObjectData,
            owner: {
              targetUri: `/units/${this.unit}`
            }
          })
          // TODO: if Backend API changes response to the created object, return only "this.$api[objectType].create(...)" from above
          return this.$api[objectType].fetch(res.resourceId)
        },
        update: (objectType: string, updatedObjectData: any) => {
          return this.$api[objectType].update(updatedObjectData)
        },
        delete: (objectType: string, id: string) => {
          this.$api[objectType].delete(id)
        }
      }
    }
  },
  watch: {
    '$route.params': '$fetch'
  },
  methods: {
    async onClick() {
      this.btnLoading = true
      this.error = undefined
      try {
        this.formatObjectData()
        if (this.objectType) {
          await this.action(this.objectType)
        } else {
          throw new Error('Object Type is not defined in FormSchema')
        }
        this.state = 'success'
      } catch (e) {
        this.state = 'error'
        this.error = e
        console.error(e)
      } finally {
        this.btnLoading = false
      }
    },
    async action(objectType: ObjectSchemaNames) {
      await this.save(objectType)
    },
    async save(objectType: ObjectSchemaNames) {
      await this.$api[objectType].update(this.$route.params.object, this.form.objectData)
    },
    formatObjectData() {
      // TODO: find better solution
      //  Add Keys and IDs manually
      if (this.form.objectData.customAspects) {
        Object.keys(this.form.objectData.customAspects).forEach((key: string) => {
          this.form.objectData.customAspects[key] = { ...this.form.objectData.customAspects[key], id: '00000000-0000-0000-0000-000000000000', type: key }
        })
      }

      if (this.form.objectData.links) {
        Object.keys(this.form.objectData.links).forEach((key: string) => {
          // this.form.objectData.links[key] = { ...this.form.objectData.links[key], type: key }
          this.form.objectData.links[key] = this.form.objectData.links[key].map((el: any) => {
            console.log(el)
            el.target.type = el.target.type?.replace(/^\w/, (c: any) => c.toUpperCase())
            el.name = key
            el.type = key
            return el
          })
        })
      }
    }
  },
  head() {
    return {
      title: 'veo.forms'
    }
  }
})
</script>

<style lang="scss" scoped></style>
