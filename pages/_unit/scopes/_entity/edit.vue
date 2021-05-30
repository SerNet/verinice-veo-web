<template>
  <VeoPageWrapper>
    <template #default>
      <VeoPage
        absolute-size
        :cols="12"
        :md="8"
        :xl="8"
        sticky-header
        :title="objectTitle"
        :loading="$fetchState.pending"
      >
        <template #default>
          <VeoEntityDisplayOptions
            :rootRoute="`/${$route.params.unit}/scopes`"
            :current-entity="form.objectData"
          >
            <v-btn
              color="primary"
              outlined
              :disabled="$fetchState.pending || isRevision"
              :loading="deleteEntityDialog.value === true"
              @click="showDeleteEntityDialog"
            >{{ $t('global.button.delete') }}</v-btn>
            <v-btn
              color="primary"
              outlined
              :disabled="$fetchState.pending || isRevision"
              :loading="saveBtnLoading"
              @click="doSaveEntity"
            >{{ $t('global.button.save') }}</v-btn>
          </VeoEntityDisplayOptions>
          <div
            v-if="$fetchState.pending"
            class="fill-width fill-height d-flex justify-center align-center"
          >
            <v-progress-circular indeterminate color="primary" size="50" />
          </div>
          <div v-else>
            <VeoForm
              v-model="form.objectData"
              :schema="form.objectSchema"
              :general-translation="form.lang && form.lang[$i18n.locale]"
              :is-valid.sync="isValid"
              :error-messages.sync="errorMessages"
              class="mb-8"
              :disabled="isRevision"
              @input="entityModified.isModified = true"
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
            <VeoEntityModifiedDialog
              v-model="entityModified.dialog"
              :item="form.objectData"
              @exit="$router.push(entityModified.target)"
            />
            <VeoWindowUnloadPrevention :value="entityModified.isModified" />
            <!-- seperate modified dialog for version switching to avoid interferences -->
            <VeoEntityModifiedDialog
              v-model="entityModified.revisionDialog"
              :item="form.objectData"
              @exit="showRevisionAfterDialog()"
            />
            <VeoDeleteEntityDialog
              v-model="deleteEntityDialog.value"
              v-bind="deleteEntityDialog"
              @success="onDeleteEntitySuccess"
              @error="onDeleteEntityError"
            />
          </div>
        </template>
      </VeoPage>
      <VeoPage absolute-size :cols="12" :md="4" :xl="4">
        <VeoTabs sticky-tabs>
          <template #tabs>
            <v-tab disabled>{{ $t('history') }}</v-tab>
          </template>
          <template #items>
            <VeoObjectHistory
              :object="form.objectData"
              :loading="$fetchState.pending"
              @show-revision="showRevision"
            />
          </template>
        </VeoTabs>
      </VeoPage>
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import { upperFirst } from 'lodash'
import { Route } from 'vue-router/types/index'

import { IBaseObject, IForm, separateUUIDParam } from '~/lib/utils'
import { IValidationErrorMessage } from '~/pages/_unit/forms/_form/_entity.vue'
import { IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents'
import { IVeoAPIMessage, IVeoEntity } from '~/types/VeoTypes'
import ObjectSchemaValidator from '~/lib/ObjectSchemaValidator'

interface IData {
  form: IForm
  isValid: boolean
  isRevision: boolean
  revisionCache: IBaseObject
  errorMessages: IValidationErrorMessage[]
  saveBtnLoading: boolean
  alert: IVeoEventPayload & { value: boolean; error: number }
  entityModified: {
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
  name: 'VeoScopesEditPage',
  data(): IData {
    return {
      form: {
        objectSchema: {},
        objectData: {},
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
      entityModified: {
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
    const objectSchema = await this.$api.schema.fetch(this.entityType)
    const { lang } = await this.$api.translation.fetch(['de', 'en'])

    let objectData = await this.$api.entity.fetch(this.entityType, this.entityId)

    this.form = {
      objectSchema,
      objectData,
      lang
    }
    this.alert.value = false
  },
  head(): any {
    return {
      title: this.objectTitle
    }
  },
  computed: {
    objectTitle(): string {
      return this.$t('edit_object', {
        title: this.$fetchState.pending ? upperFirst(this.entityType) : this.form.objectData.displayName
      })
    },
    entityId(): string {
      return separateUUIDParam(this.$route.params.entity).id
    },
    entityType(): string {
      return separateUUIDParam(this.$route.params.entity).type
    }
  },
  methods: {
    doSaveEntity() {
      this.saveBtnLoading = true
      this.formatObjectData()

      this.$api.entity
        .update(this.entityType, this.entityId, this.form.objectData)
        .then(async (_data: IVeoAPIMessage) => {
          this.entityModified.isModified = false
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('object_saved') })

          this.$router.back()
        })
        .catch((error: { status: number; name: string }) => {
          this.showError(error.status, error.name)
        })
        .finally(() => {
          this.saveBtnLoading = false
        })
    },
    showDeleteEntityDialog() {
      this.deleteEntityDialog.item = this.form.objectData as any
      this.deleteEntityDialog.value = true
    },
    onDeleteEntitySuccess() {
      this.entityModified.isModified = false
      this.deleteEntityDialog.value = false
      this.$router.go(-2)
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
    },
    async showRevision(_event: any, content: IBaseObject, isRevision: boolean) {
      // show modified dialog before switching versions if needed
      if (this.entityModified.isModified) {
        this.revisionCache = content // cache revision for use after modified-dialog is closed with "yes"
        this.entityModified.revisionDialog = true
      } else {
        if (isRevision && !this.validateRevisionSchema(content)) {
          return
        }
        // fill form with revision or newest data
        this.isRevision = isRevision
        if (isRevision) {
          this.form.objectData = content // show revision content in form
          this.form.objectData.displayName = `${content.abbreviation || ''} ${content.name}`
        } else {
          await this.$fetch() // refetch newest version from entity endpoint, not history
        }
      }
    },
    async showRevisionAfterDialog() {
      // close dialog without action if revision schema is invalid
      if (!this.validateRevisionSchema(this.revisionCache)) {
        this.entityModified.revisionDialog = false
        return
      }
      // fill form with cached revision data and close dialog
      this.isRevision = true
      this.form.objectData = this.revisionCache
      this.entityModified.revisionDialog = false
      this.entityModified.isModified = false
    },
    validateRevisionSchema(revision: IBaseObject) {
      const validator = new ObjectSchemaValidator()

      delete revision.displayName
      const isValid = validator.fitsObjectSchema(this.form.objectSchema, revision)
      if (!isValid) {
        this.showError(500, this.$t('revision_incompatible'))
      }
      return isValid
    }
  },
  beforeRouteLeave(to: Route, _from: Route, next: Function) {
    // If the form was modified and the dialog is open, the user wanted to proceed with his navigation
    if (this.entityModified.isModified && this.entityModified.dialog) {
      next()
    } else if (this.entityModified.isModified) {
      // If the form was modified and the dialog is closed, show it and abort navigation
      this.entityModified.target = to
      this.entityModified.dialog = true
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
    "deleted": "Object was deleted successfully.",
    "edit_object": "Edit \"{title}\"",
    "history": "History",
    "object_delete_error": "Failed to delete object",
    "object_saved": "Object saved successfully",
    "scope_delete_error": "Failed to delete scope",
    "revision_incompatible": "The revision is incompatible to the schema and cannot be shown."
  },
  "de": {
    "deleted": "Objekt wurde erfolgreich gelöscht.",
    "edit_object": "\"{title}\" bearbeiten",
    "history": "Verlauf",
    "object_delete_error": "Objekt konnte nicht gelöscht werden",
    "object_saved": "Objekt wurde gespeichert!",
    "scope_delete_error": "Scope konnte nicht gelöscht werden",
    "revision_incompatible": "Die Version ist inkompatibel zum Schema und kann daher nicht angezeigt werden."
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
