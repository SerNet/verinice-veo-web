<template>
  <div v-if="$fetchState.pending" class="fill-width fill-height d-flex justify-center align-center">
    <v-progress-circular indeterminate color="primary" size="50" />
  </div>
  <VeoPageWrapper v-else>
    <VeoPage v-if="!contentsCollapsed && formSchemaHasGroups" :cols="2" :md="2" :xl="2" absolute-size>
      <div class="button text-uppercase accent--text font-weight-medium my-2">
        {{ $t('page.forms.navigation.group.title') }}
      </div>
      <VeoFormNavigation :formSchema="form.formSchema && form.formSchema.content" class="mx-n4" />
    </VeoPage>
    <v-divider vertical />
    <VeoPage
      absolute-size
      :cols="!contentsCollapsed && formSchemaHasGroups ? 6 : 8"
      :md="!contentsCollapsed && formSchemaHasGroups ? 6 : 8"
      :xl="!contentsCollapsed && formSchemaHasGroups ? 6 : 8"
      sticky-header
      id="scroll-wrapper"
    >
      <template #header>
        <CollapseButton v-if="!$vuetify.breakpoint.xs && formSchemaHasGroups" v-model="contentsCollapsed" />
        <v-row>
          <v-col>
            <h1>{{ form.objectData.name }}</h1>
          </v-col>
          <v-spacer />
          <v-col class="text-right">
            <v-btn v-if="$route.params.entity" text outlined :loading="deleteBtnLoading" @click="showDeleteDialog()">
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
          :general-translation="form.lang && form.lang[$i18n.locale]"
          :custom-translation="
            form.formSchema && form.formSchema.translation && form.formSchema.translation[$i18n.locale]
          "
          :api="dynamicAPI"
          :is-valid.sync="isValid"
          :error-messages.sync="errorMessages"
          @input="formModified.isModified = true"
        />
        <DeleteFormDialog v-model="deleteDialog" :form="form.objectData" @delete="doDelete" />
        <VeoFormModifiedDialog
          v-model="formModified.dialog"
          :item="form.objectData"
          @exit="$router.push(formModified.target)"
        />
        <VeoAlert
          v-model="alert.value"
          v-bind="alert"
          style="position: fixed; width: 60%; bottom: 0; left: 20%; z-index: 1"
        >
          <template v-if="alert.error === 412" #additional-button>
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
          <v-tab :to="linkToHistory" :disabled="!$route.params.entity">{{ $t('unit.data.history') }}</v-tab>
        </template>
      </VeoTabs>
      <nuxt-child
        v-if="form.objectData"
        :object="form.objectData"
      />
    </VeoPage>
  </VeoPageWrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router/types/index'

import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'
import VeoPage from '~/components/layout/VeoPage.vue'
import VeoTabs from '~/components/layout/VeoTabs.vue'
import DeleteFormDialog from '~/components/objects/VeoDeleteFormDialog.vue'
import VeoFormModifiedDialog from '~/components/objects/VeoFormModifiedDialog.vue'
import VeoCollapseButton from '~/components/layout/VeoCollapseButton.vue'
import { IForm, separateUUIDParam } from '~/lib/utils'
import VeoForm from '~/components/forms/VeoForm.vue'
import { IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents'
import { getSchemaEndpoint } from '~/plugins/api/schema'

export interface IValidationErrorMessage {
  pointer: string
  message: string
}

interface IData {
  panel: number[]
  objectType: string | undefined
  form: IForm
  isValid: boolean
  errorMessages: IValidationErrorMessage[]
  saveBtnLoading: boolean
  deleteBtnLoading: boolean
  deleteDialog: boolean
  alert: IVeoEventPayload & { value: boolean, error: number }
  contentsCollapsed: boolean
  formModified: {
    isModified: boolean
    dialog: boolean
    target?: Route
  }
}

export default Vue.extend({
  name: 'VeoFormsObjectDataUpdate',
  components: {
    VeoForm,
    VeoPageWrapper,
    VeoPage,
    VeoTabs,
    DeleteFormDialog,
    VeoCollapseButton,
    VeoFormModifiedDialog
  },
  data(): IData {
    return {
      panel: [],
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
        saveButtonText: this.$t('global.button.no') as string,
        error: 0 as number
      },
      contentsCollapsed: false as boolean,
      formModified: {
        isModified: false,
        dialog: false,
        target: undefined
      }
    }
  },
  async fetch() {
    const formSchema = await this.$api.form.fetch(this.formId)
    this.objectType = formSchema.modelType && formSchema.modelType.toLowerCase()
    if (this.objectType) {
      const objectSchema = await this.$api.schema.fetch(this.objectType)
      const objectData = this.$route.params.entity
        ? await this.$api.entity.fetch(getSchemaEndpoint(this.objectType), this.objectId)
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
      return this.$fetchState.pending
        ? this.$t('breadcrumbs.forms')
        : `${this.form.objectData.name} - ${this.$t('breadcrumbs.forms')}`
    },
    unitId(): string {
      return separateUUIDParam(this.$route.params.unit).id
    },
    unitRoute() {
      return this.$route.params.unit
    },
    formId(): string {
      return separateUUIDParam(this.$route.params.form).id
    },
    formRoute() {
      return this.$route.params.form
    },
    objectId(): string {
      return separateUUIDParam(this.$route.params.entity).id
    },
    objectRoute() {
      return this.$route.params.entity
    },
    dynamicAPI(): any {
      // TODO: adjust this dynamicAPI so that it provided directly by $api
      return {
        fetchAll: (objectType: string, searchParams?: any) => {
          return this.$api.entity.fetchAll(getSchemaEndpoint(objectType), {
            ...searchParams,
            unit: this.unitId
          })
        },
        create: async (objectType: string, createdObjectData: any) => {
          const res = await this.$api.entity.create(getSchemaEndpoint(objectType), {
            ...createdObjectData,
            owner: {
              targetUri: `/units/${this.unitId}`
            }
          })
          // TODO: if Backend API changes response to the created object, return only "this.$api[objectType].create(...)" from above
          return this.$api.entity.fetch(getSchemaEndpoint(objectType), res.resourceId)
        },
        update: (objectType: string, updatedObjectData: any) => {
          return this.$api.entity.update(getSchemaEndpoint(objectType), updatedObjectData)
        },
        delete: (objectType: string, id: string) => {
          this.$api.entity.delete(getSchemaEndpoint(objectType), id)
        }
      }
    },
    linkToLinks(): string {
      return this.$route.params.entity ? `/${this.unitRoute}/forms/${this.formRoute}/${this.objectRoute}/links` : '#'
    },
    linkToHistory(): string {
      return this.$route.params.entity ? `/${this.unitRoute}/forms/${this.formRoute}/${this.objectRoute}/history` : '#'
    },
    formSchemaHasGroups(): boolean {
      if(this.form.formSchema?.content.elements) {
        return this.form.formSchema?.content?.elements?.findIndex((element: any) => (element.type === 'Layout' || element.type === 'Group') && element.options.label) > -1
      } else {
        return false
      }
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
      await this.$api.entity
        .update(getSchemaEndpoint(objectType), this.objectId, this.form.objectData)
        .then(() => {
          this.formModified.isModified = false
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('unit.data.saved') })
          this.$router.push({
            path: `/${this.unitRoute}/forms/${this.formRoute}/`
          })
        })
        .catch((error: { status: number; name: string }) => {
          this.showError(error.status, error.name)
        })
    },
    showDeleteDialog() {
      this.deleteDialog = true
    },
    async doDelete() {
      this.deleteDialog = false
      this.deleteBtnLoading = true
      await this.$api.entity
        .delete(getSchemaEndpoint(this.objectType || ''), this.objectId)
        .then(() => {
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('global.appstate.alert.success') })
          this.$router.push({
            path: `/${this.unitRoute}/forms/${this.formRoute}/`
          })
        })
        .catch((error: { status: number; name: string }) => {
          this.showError(error.status, error.name)
        })
        .finally(() => {
          this.deleteBtnLoading = false
        })
    },
    showError(status: number, message: string) {
      if(status === 412) {
        this.alert.text = this.$t('unit.forms.nrr')
        this.alert.saveButtonText = this.$t('global.button.no')
      } else {
        this.alert.text = message
        this.alert.saveButtonText = this.$t('global.button.ok')
      }
      this.alert.error = status
      this.alert.value = true
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
  },
  beforeRouteLeave(to: Route, _from: Route, next: Function) {
    // If the form was modified and the dialog is open, the user wanted to proceed with his navigation
    if(this.formModified.isModified && this.formModified.dialog) {
      next()
    } else if (this.formModified.isModified) { // If the form was modified and the dialog is closed, show it and abort navigation
      this.formModified.target = to
      this.formModified.dialog = true
      next(false)
    } else { // The form wasn't modified, proceed as if this hook doesn't exist
      next()
    }
  }
})
</script>

<style lang="scss" scoped></style>
