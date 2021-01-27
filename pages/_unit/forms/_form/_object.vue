<template>
  <div v-if="$fetchState.pending" class="fill-width fill-height d-flex justify-center align-center">
    <v-progress-circular indeterminate color="primary" size="50" />
  </div>
  <VeoPageWrapper v-else>
    <VeoPage :cols="2" :md="2" :xl="2" absolute-size>
      <VeoFormNavigation />
    </VeoPage>
    <v-divider vertical />
    <VeoPage absolute-size :cols="6" :md="6" :xl="6" sticky-header>
      <template #header>
        <v-row>
          <v-col>
            <h1>{{ form.objectData.name }}</h1>
          </v-col>
          <v-spacer />
          <v-col class="text-right">
            <v-btn text outlined :loading="deleteBtnLoading" @click="showDeleteDialog()">
              {{ $t('global.button.delete') }}
            </v-btn>
            <v-btn color="primary" outlined text :loading="saveBtnLoading" @click="onClick">
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
        <DeleteFormDialog v-model="deleteDialog" :form="form.objectData" @delete="doDelete" />
        <VeoAlert
          v-model="alert.value"
          v-bind="alert"
          style="position: fixed; width: 60%; bottom: 0; left: 20%; z-index: 1"
        >
          <template #additional-button>
            <v-btn outlined text color="error" @click="$fetch()">{{ $t('global.button.yes') }}</v-btn>
          </template>
        </VeoAlert>
      </template>
    </VeoPage>
    <v-divider vertical />
    <VeoPage v-if="!$vuetify.breakpoint.xsOnly" :cols="4" :md="4" :xl="4" absolute-size>
      <VeoTabs>
        <template #tabs>
          <v-tab :to="linkToLinks">{{ $t('unit.data.links') }}</v-tab>
          <v-tab :to="linkToHistory">{{ $t('unit.data.history') }}</v-tab>
        </template>
      </VeoTabs>
      <nuxt-child
        v-if="form.objectData"
        :createdAt="form.objectData.createdAt"
        :createdBy="form.objectData.createdBy"
        :updatedAt="form.objectData.updatedAt"
        :updatedBy="form.objectData.updatedBy"
      />
    </VeoPage>
  </VeoPageWrapper>
</template>

<script lang="ts">
import Vue from 'vue'

import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'
import VeoPage from '~/components/layout/VeoPage.vue'
import VeoTabs from '~/components/layout/VeoTabs.vue'
import { IForm } from '~/lib/utils'
import VeoForm from '~/components/forms/VeoForm.vue'
import { VeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents'
import { getSchemaEndpoint } from '~/plugins/api/schema'

export interface IValidationErrorMessage {
  pointer: string
  message: string
}

interface IData {
  panel: number[]
  activeLanguage: string
  objectType: string | undefined
  form: IForm
  isValid: boolean
  errorMessages: IValidationErrorMessage[]
  saveBtnLoading: boolean
  deleteBtnLoading: boolean
  deleteDialog: boolean
  alert: VeoEventPayload & { value: boolean }
}

export default Vue.extend({
  name: 'VeoFormsObjectDataUpdate',
  components: {
    VeoForm,
    VeoPageWrapper,
    VeoPage,
    VeoTabs
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
      saveBtnLoading: false,
      deleteBtnLoading: false,
      deleteDialog: false,
      alert: {
        value: false,
        text: '',
        type: 0,
        title: this.$t('global.appstate.alert.error') as string,
        saveButtonText: this.$t('global.button.no') as string
      }
    }
  },
  async fetch() {
    const formSchema = await this.$api.form.fetch(this.$route.params.form)
    this.objectType = formSchema.modelType && formSchema.modelType.toLowerCase()
    if (this.objectType) {
      const objectSchema = await this.$api.schema.fetch(this.objectType)
      const objectData = this.$route.params.object
        ? await this.$api.object.fetch(getSchemaEndpoint(this.objectType), this.$route.params.object)
        : {}
      const { lang } = await this.$api.translation.fetch(['de', 'en'])
      this.form = {
        objectSchema,
        formSchema,
        objectData,
        lang
      }

      // Add subtype to object data so it gets saved
      if (this.form.formSchema?.subType) {
        // Sub type is not set yet, if the object is created
        if (!this.form.objectData.subType) {
          this.form.objectData.subType = { [this.$user.currentDomain]: this.form.formSchema?.subType }
        } else {
          this.form.objectData.subType[this.$user.currentDomain] = this.form.formSchema?.subType
        }
      }

      // Add domain to object data so it gets saved
      const domainObject = { targetUri: `/domains/${this.$user.currentDomain}` }
      if (!this.form.objectData.domains) {
        this.form.objectData.domains = [domainObject]
      } else {
        this.form.objectData.domains.push(domainObject)
      }
    } else {
      throw new Error('Object Type is not defined in FormSchema')
    }
    this.alert.value = false
  },
  head(): any {
    return {
      title: this.title
    }
  },
  computed: {
    title(): string {
      return this.$fetchState.pending ? 'veo.Forms' : `${this.form.objectData.name} - veo.Forms`
    },
    unit(): string {
      return this.$route.params.unit
    },
    formId(): string {
      return this.$route.params.form
    },
    object(): string {
      return this.$route.params.object
    },
    dynamicAPI(): any {
      // TODO: adjust this dynamicAPI so that it provided directly by $api
      return {
        fetchAll: (objectType: string, searchParams?: any) => {
          return this.$api.object.fetchAll(getSchemaEndpoint(objectType), {
            ...searchParams,
            unit: this.$route.params.unit
          })
        },
        create: async (objectType: string, createdObjectData: any) => {
          const res = await this.$api.object.create(getSchemaEndpoint(objectType), {
            ...createdObjectData,
            owner: {
              targetUri: `/units/${this.unit}`
            }
          })
          // TODO: if Backend API changes response to the created object, return only "this.$api[objectType].create(...)" from above
          return this.$api.object.fetch(getSchemaEndpoint(objectType), res.resourceId)
        },
        update: (objectType: string, updatedObjectData: any) => {
          return this.$api.object.update(getSchemaEndpoint(objectType), updatedObjectData)
        },
        delete: (objectType: string, id: string) => {
          this.$api.object.delete(getSchemaEndpoint(objectType), id)
        }
      }
    },
    linkToLinks(): string {
      return `/${this.unit}/forms/${this.formId}/${this.object}/links`
    },
    linkToHistory(): string {
      return `/${this.unit}/forms/${this.formId}/${this.object}/history`
    }
  },
  methods: {
    async onClick() {
      this.saveBtnLoading = true
      this.formatObjectData()
      if (this.objectType) {
        await this.action(this.objectType).finally(() => {
          this.saveBtnLoading = false
        })
      } else {
        throw new Error('Object Type is not defined in FormSchema')
        this.saveBtnLoading = false
      }
    },
    async action(objectType: string) {
      await this.save(objectType)
    },
    async save(objectType: string) {
      await this.$api.object
        .update(getSchemaEndpoint(objectType), this.object, this.form.objectData)
        .then(() => {
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('unit.data.saved') })
          this.$fetch()
        })
        .catch((error: { status: number; name: string }) => {
          this.alert.text = error.status === 412 ? this.$t('unit.forms.nrr') : ''
          this.alert.value = true
        })
    },
    showDeleteDialog() {
      this.deleteDialog = true
    },
    async doDelete() {
      this.deleteDialog = false
      this.deleteBtnLoading = true
      await this.$api.object
        .delete(getSchemaEndpoint(this.objectType || ''), this.object)
        .then(() => {
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('global.appstate.alert.success') })
          this.$router.push({
            path: `/${this.unit}/forms/${this.formId}/`
          })
        })
        .catch((error: { status: number; name: string }) => {
          this.alert.text = error.status === 412 ? this.$t('unit.forms.nrr') : ''
          this.alert.value = true
        })
        .finally(() => {
          this.deleteBtnLoading = false
        })
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
