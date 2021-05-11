<template>
  <div v-if="$fetchState.pending" class="fill-width fill-height d-flex justify-center align-center">
    <v-progress-circular indeterminate color="primary" size="50" />
  </div>
  <VeoPageWrapper v-else>
    <VeoPage
      v-if="!contentsCollapsed && formSchemaHasGroups"
      :cols="2"
      :md="2"
      :xl="2"
      absolute-size
    >
      <div
        class="button text-uppercase accent--text font-weight-medium my-2"
      >{{ $t('navigation.title') }}</div>
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
        <VeoCollapseButton
          v-if="!$vuetify.breakpoint.xs && formSchemaHasGroups"
          v-model="contentsCollapsed"
        />
        <v-row class="justify-space-between">
          <v-col cols="auto">
            <h1>{{ form.objectData.name }}</h1>
          </v-col>
          <v-spacer />
          <v-col cols="auto" class="text-right">
            <v-btn
              v-if="$route.params.entity"
              text
              outlined
              :loading="deleteEntityDialog.value === true"
              :disabled="isRevision"
              @click="showDeleteEntityDialog"
            >{{ $t('global.button.delete') }}</v-btn>
            <v-btn
              color="primary"
              outlined
              text
              :loading="saveBtnLoading"
              :disabled="isRevision"
              @click="onClick"
            >{{ $t('global.button.save') }}</v-btn>
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
          :disabled="isRevision"
          @input="formModified.isModified = true"
        />
        <VeoDeleteEntityDialog
          v-model="deleteEntityDialog.value"
          v-bind="deleteEntityDialog"
          @success="onDeleteEntitySuccess"
          @error="onDeleteEntityError"
        />
        <VeoEntityModifiedDialog
          v-model="formModified.dialog"
          :item="form.objectData"
          @exit="$router.push(formModified.target)"
        />
        <!-- seperate modified dialog for version switching to avoid interferences -->
        <VeoEntityModifiedDialog
          v-model="formModified.revisionDialog"
          :item="form.objectData"
          @exit="showRevisionAfterDialog()"
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
      <VeoTabs sticky-tabs>
        <template #tabs>
          <v-tab>{{ $t('links') }}</v-tab>
          <v-tab :disabled="!$route.params.entity">{{ $t('history') }}</v-tab>
        </template>
        <template #items>
          <v-tab-item>
            <VeoObjectLinks :object="form.objectData" />
          </v-tab-item>
          <v-tab-item>
            <VeoObjectHistory
              :object="form.objectData"
              :loading="$fetchState.pending"
              @show-revision="showRevision"
            />
          </v-tab-item>
        </template>
      </VeoTabs>
    </VeoPage>
  </VeoPageWrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router/types/index'
import ObjectSchemaValidator from '~/lib/ObjectSchemaValidator'

import { IBaseObject, IForm, separateUUIDParam } from '~/lib/utils'
import { IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents'
import { IVeoEntity } from '~/types/VeoTypes'

export interface IValidationErrorMessage {
  pointer: string
  message: string
}

interface IData {
  objectType: string | undefined
  form: IForm
  isValid: boolean
  isRevision: boolean
  revisionCache: IBaseObject
  errorMessages: IValidationErrorMessage[]
  saveBtnLoading: boolean
  alert: IVeoEventPayload & { value: boolean; error: number }
  contentsCollapsed: boolean
  formModified: {
    isModified: boolean
    dialog: boolean
    revisionDialog: boolean
    target?: Route
  }
  deleteEntityDialog: {
    value: boolean
    item?: IVeoEntity
  }
}

export default Vue.extend({
  name: 'VeoFormsObjectDataUpdate',
  data(): IData {
    return {
      objectType: undefined,
      form: {
        objectSchema: {},
        objectData: {},
        formSchema: undefined,
        lang: {}
      },
      isValid: true,
      isRevision: false,
      revisionCache: {},
      errorMessages: [],
      saveBtnLoading: false,
      alert: {
        value: false,
        text: '',
        type: 0,
        title: this.$t('error.title') as string,
        saveButtonText: this.$t('global.button.no') as string,
        error: 0 as number
      },
      contentsCollapsed: false as boolean,
      formModified: {
        isModified: false,
        dialog: false,
        revisionDialog: false,
        target: undefined
      },
      deleteEntityDialog: {
        value: false,
        item: undefined
      }
    }
  },
  async fetch() {
    const formSchema = await this.$api.form.fetch(this.formId)
    this.objectType = formSchema.modelType
    if (this.objectType) {
      const objectSchema = await this.$api.schema.fetch(this.objectType)
      const objectData = this.$route.params.entity ? await this.$api.entity.fetch(this.objectType, this.objectId) : {}
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
          return this.$api.entity.fetchAll(objectType, {
            ...searchParams,
            unit: this.unitId
          })
        },
        create: async (objectType: string, createdObjectData: any) => {
          const res = await this.$api.entity.create(objectType, {
            ...createdObjectData,
            owner: {
              targetUri: `/units/${this.unitId}`
            }
          })
          // TODO: if Backend API changes response to the created object, return only "this.$api[objectType].create(...)" from above
          return this.$api.entity.fetch(objectType, res.resourceId)
        },
        update: (objectType: string, updatedObjectData: any) => {
          return this.$api.entity.update(objectType, updatedObjectData)
        },
        delete: (objectType: string, id: string) => {
          this.$api.entity.delete(objectType, id)
        }
      }
    },
    formSchemaHasGroups(): boolean {
      if (this.form.formSchema?.content.elements) {
        return (
          this.form.formSchema?.content?.elements?.findIndex(
            (element: any) => (element.type === 'Layout' || element.type === 'Group') && element.options.label
          ) > -1
        )
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
        await this.onSave().finally(() => {
          this.saveBtnLoading = false
        })
      } else {
        throw new Error('Object Type is not defined in FormSchema')
      }
    },
    onSave(): Promise<void> {
      return this.$api.entity
        .update(this.objectType, this.objectId, this.form.objectData)
        .then(() => {
          this.formModified.isModified = false
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('object_saved') })
          this.$router.push({
            path: `/${this.unitRoute}/forms/${this.formRoute}/`
          })
        })
        .catch((error: { status: number; name: string }) => {
          this.showError(error.status, error.name)
        })
    },
    showDeleteEntityDialog() {
      this.deleteEntityDialog.item = this.form.objectData as any
      this.deleteEntityDialog.value = true
    },
    onDeleteEntitySuccess() {
      this.formModified.isModified = false
      this.deleteEntityDialog.value = false
      this.$router.go(-1)
    },
    onDeleteEntityError(error: any) {
      this.$root.$emit(VeoEvents.ALERT_ERROR, {
        title:
          this.deleteEntityDialog.item?.type === 'scope'
            ? this.$t('scope_delete_error')
            : this.$t('object_delete_error'),
        text: JSON.stringify(error)
      })
    },
    showError(status: number, message: string) {
      if (status === 412) {
        this.alert.text = this.$t('global.appstate.alert.object_modified')
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
    },
    async showRevision(_event: any, content: IBaseObject, isRevision: boolean) {
      // show modified dialog before switching versions if needed
      if (this.formModified.isModified) {
        this.revisionCache = content // cache revision for use after modified-dialog is closed with "yes"
        this.formModified.revisionDialog = true
      } else {
        if (isRevision && !this.validateRevisionSchema(content)) {
          return
        }
        // fill form with revision or newest data
        this.isRevision = isRevision
        if (isRevision) {
          this.form.objectData = content // show revision content in form
        } else {
          await this.$fetch() // refetch newest version from entity endpoint, not history
        }
      }
    },
    async showRevisionAfterDialog() {
      // close dialog without action if revision schema is invalid
      if (!this.validateRevisionSchema(this.revisionCache)) {
        this.formModified.revisionDialog = false
        return
      }
      // fill form with cached revision data and clsoe dialog
      this.isRevision = true
      this.form.objectData = this.revisionCache
      this.formModified.revisionDialog = false
      this.formModified.isModified = false
    },
    validateRevisionSchema(revision: IBaseObject) {
      const validator = new ObjectSchemaValidator()
      const isValid = validator.fitsObjectSchema(this.form.objectSchema, revision)
      if (!isValid) {
        this.showError(500, this.$t('revision_incompatible'))
      }
      return isValid
    }
  },
  beforeRouteLeave(to: Route, _from: Route, next: Function) {
    // If the form was modified and the dialog is open, the user wanted to proceed with his navigation
    if (this.formModified.isModified && this.formModified.dialog) {
      next()
    } else if (this.formModified.isModified) {
      // If the form was modified and the dialog is closed, show it and abort navigation
      this.formModified.target = to
      this.formModified.dialog = true
      next(false)
    } else {
      // The form wasn't modified, proceed as if this hook doesn't exist
      next()
    }
  }
})
</script>

<i18n>
{
  "en": {
    "history": "History",
    "links": "Links",
    "navigation.title": "Contents",
    "object_delete_error": "Failed to delete object",
    "object_saved": "Object saved successfully",
    "scope_delete_error": "Failed to delete scope",
    "revision_incompatible": "The revision is incompatible to the schema and cannot be shown."
  },
  "de": {
    "history": "Verlauf",
    "links": "Links",
    "navigation.title": "Inhalt",
    "object_delete_error": "Objekt konnte nicht gelöscht werden",
    "object_saved": "Objekt wurde gespeichert!",
    "scope_delete_error": "Scope konnte nicht gelöscht werden",
    "revision_incompatible": "Die Version ist inkompatibel zum Schema und kann daher nicht angezeigt werden."
  }
}
</i18n>
