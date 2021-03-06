<template>
  <div v-if="$fetchState.pending" class="fill-width fill-height d-flex justify-center align-center">
    <v-progress-circular indeterminate color="primary" size="50" />
  </div>
  <VeoPageWrapper v-else>
    <VeoPage absolute-size :cols="8" :md="8" :xl="8" sticky-header>
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
          :general-translation="form.lang && form.lang[activeLanguage]"
          :is-valid.sync="isValid"
          :error-messages.sync="errorMessages"
          class="mb-8"
        />
        <DeleteObjectDialog v-model="deleteDialog" :form="form.objectData" @delete="deleteObject" />
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
import { IForm, separateUUIDParam } from '~/lib/utils'
import { IValidationErrorMessage } from '~/pages/_unit/forms/_form/_object.vue'
import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'
import VeoPage from '~/components/layout/VeoPage.vue'
import VeoTabs from '~/components/layout/VeoTabs.vue'

import VeoForm from '~/components/forms/VeoForm.vue'
import { VeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents'
import { getSchemaName } from '~/plugins/api/schema'
import { capitalize } from 'lodash'
import DeleteObjectDialog from '~/components/dialogs/DeleteObjectDialog.vue'

interface IData {
  panel: number[]
  activeLanguage: string
  deleteDialog: boolean
  form: IForm
  isValid: boolean
  errorMessages: IValidationErrorMessage[]
  saveBtnLoading: boolean
  deleteBtnLoading: boolean
  alert: VeoEventPayload & { value: boolean }
}

export default Vue.extend({
  components: {
    VeoForm,
    VeoPageWrapper,
    VeoPage,
    VeoTabs,
    DeleteObjectDialog
  },
  middleware({ route, params, redirect }) {
    // TODO Nur weiterleiten, wenn Desktop
    if (route.name === 'unit-data-type-group-id') {
      return redirect(`/${params.unit}/objects/${params.type}/${params.group}/${params.id}/links`)
    }
  },
  data(): IData {
    return {
      panel: [],
      activeLanguage: 'de',
      deleteDialog: false,
      form: {
        objectSchema: {},
        objectData: {},
        lang: {}
      },
      isValid: true,
      errorMessages: [],
      saveBtnLoading: false,
      deleteBtnLoading: false,
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
    const objectSchema = await this.$api.schema.fetch(this.schemaType)
    const { lang } = await this.$api.translation.fetch(['de', 'en'])
    const objectData = await this.$api.entity.fetch(this.schemaEndpoint, this.objectId)
    this.form = {
      objectSchema,
      objectData,
      lang
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
        ? this.$t('breadcrumbs.objects')
        : `${this.form.objectData.name} - ${capitalize(this.schemaType)} - ${this.$t('breadcrumbs.objects')}`
    },
    schemaType(): string | undefined {
      return getSchemaName(this.schemaEndpoint || '')
    },
    schemaEndpoint(): string | undefined {
      return this.$route.params.type
    },
    objectGroup(): string {
      return this.$route.params.group
    },
    objectId(): string {
      return separateUUIDParam(this.$route.params.id).id
    },
    objectRoute(): string {
      return this.$route.params.id
    },
    unitId(): string {
      return separateUUIDParam(this.$route.params.unit).id
    },
    unitRoute(): string {
      return this.$route.params.unit
    },
    linkToLinks(): string {
      return `/${this.unitRoute}/objects/${this.schemaEndpoint}/${this.objectGroup}/${this.objectRoute}/links`
    },
    linkToHistory(): string {
      return `/${this.unitRoute}/objects/${this.schemaEndpoint}/${this.objectGroup}/${this.objectRoute}/history`
    }
  },
  methods: {
    showDeleteDialog() {
      this.deleteDialog = true
    },
    async onClick() {
      this.saveBtnLoading = true
      this.formatObjectData()
      this.action(this.schemaEndpoint || '').finally(() => {
        this.saveBtnLoading = false
      })
    },
    async action(objectType: string) {
      await this.save(objectType)
    },
    async save(objectType: string) {
      await this.$api.entity
        .update(this.schemaEndpoint, this.objectId, this.form.objectData)
        .then(() => {
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('unit.data.saved') })
          this.$fetch()
        })
        .catch((error: { status: number; name: string }) => {
          this.alert.text = error.status === 412 ? this.$t('unit.forms.nrr') : ''
          this.alert.value = true
        })
    },
    async deleteObject() {
      this.deleteDialog = false
      this.deleteBtnLoading = true

      await this.$api.entity
        .delete(this.schemaEndpoint, this.objectId)
        .then(() => {
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('global.appstate.alert.success') })
          this.$router.push({
            path: `/${this.unitRoute}/objects/${this.schemaEndpoint}/${this.objectGroup}/`
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
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
