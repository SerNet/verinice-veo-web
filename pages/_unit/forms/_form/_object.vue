<template>
  <div v-if="$fetchState.pending">
    <div class="text-center ma-12">
      <v-progress-circular indeterminate color="primary" size="50" />
    </div>
  </div>
  <VeoPage v-else :title="form.objectData.name" sticky-header>
    <template #header>
      <v-row>
        <v-col :cols="6" />
        <v-col :cols="6" class="text-right">
          <v-btn color="primary" text outlined :loading="btnLoading" @click="onClick">
            {{ $t('global.button.save') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <template #default>
      <VeoForm
        v-model="form.objectData"
        :schema="form.objectSchema"
        :ui="form.formSchema && form.formSchema.content"
        :lang="form.lang && form.lang[activeLanguage]"
        :api="dynamicAPI"
        :is-valid.sync="isValid"
        :error-messages.sync="errorMessages"
      />

      <div class="mx-auto" style="max-width:800px; width:100%;">
        <AppStateDialog
          v-if="error && error.status == 412"
          :value="!!error"
          title="Fehler"
          @input="error = undefined"
          @yes="$fetch"
        >
          <template v-if="error">
            <span v-if="error && error.status == 412">{{ $t('unit.forms.nrr') }}</span>
            <span v-else v-text="error" />
          </template>
        </AppStateDialog>
      </div>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'

import { IForm } from '~/lib/utils'
import AppStateDialog from '~/components/AppStateDialog.vue'
import VeoForm from '~/components/forms/VeoForm.vue'
import VeoPage from '~/components/layout/VeoPage.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'

import { ObjectSchemaNames } from '~/types/FormSchema'

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
  error?: Error & { status?: number }
  btnLoading: boolean
}

export default Vue.extend({
  name: 'VeoFormsObjectDataUpdate',
  components: {
    AppStateDialog,
    VeoForm,
    VeoPage
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
      error: undefined,
      btnLoading: false
    }
  },
  async fetch() {
    const formSchema = await this.$api.form.fetch(this.$route.params.form)
    this.objectType = formSchema.modelType && formSchema.modelType.toLowerCase()
    if (this.objectType && this.objectType in ObjectSchemaNames) {
      const objectSchema = await this.$api.schema.fetch(this.objectType)
      const objectData = this.$route.params.object
        ? await this.$api[this.objectType].fetch(this.$route.params.object)
        : {}
      const { lang } = await this.$api.translation.fetch(['de', 'en'])
      this.form = {
        objectSchema,
        formSchema,
        objectData,
        lang
      }
      console.log(this.form)
    } else {
      throw new Error('Object Type is not defined in FormSchema')
    }
  },
  head(): any {
    return {
      title: this.title
    }
  },
  computed: {
    title(): string {
      return this.$fetchState.pending ? 'veo.forms' : `${this.form.objectData.name} - veo.forms`
    },
    unit(): string {
      return this.$route.params.unit
    },
    dynamicAPI(): any {
      // TODO: adjust this dynamicAPI so that it provided directly by $api
      return {
        fetchAll: (objectType: string, searchParams?: any) => {
          return this.$api[objectType].fetchAll({
            ...searchParams,
            unit: this.$route.params.unit
          })
        },
        create: async (objectType: string, createdObjectData: any) => {
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
        this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('global.appstate.alert.success') })
        this.$fetch()
      } catch (e) {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          title: this.$t('global.appstate.alert.error'),
          text: e
        })
        this.error = e
      } finally {
        this.btnLoading = false
      }
    },
    async action(objectType: ObjectSchemaNames) {
      await this.save(objectType)
    },
    async save(objectType: ObjectSchemaNames) {
      // TODO: SubType für Domain setzen
      const domainId = '00000000-0000-0000-0000-000000000000'
      this.form.objectData.subType[domainId] = this.form.formSchema?.subType || domainId
      await this.$api[objectType].update(this.$route.params.object, this.form.objectData)
    },
    formatObjectData() {
      // TODO: find better solution
      //  Add Keys and IDs manually
      if (this.form.objectData.customAspects) {
        Object.keys(this.form.objectData.customAspects).forEach((key: string) => {
          this.form.objectData.customAspects[key] = {
            ...this.form.objectData.customAspects[key],
            id: '00000000-0000-0000-0000-000000000000',
            type: key
          }
        })
      }

      if (this.form.objectData.links) {
        Object.keys(this.form.objectData.links).forEach((key: string) => {
          if (!this.form.objectData.links[key]) {
            delete this.form.objectData.links[key]
          } else {
            // this.form.objectData.links[key] = { ...this.form.objectData.links[key], type: key }
            this.form.objectData.links[key] = this.form.objectData.links[key].map((el: any) => {
              // el.target.type = el.target.type?.replace(/^\w/, (c: any) => c.toUpperCase())
              el.name = key
              // el.type = key
              return el
            })
          }
        })
      }
    }
  }
})
</script>

<style lang="scss" scoped></style>
