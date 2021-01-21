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
          :lang="form.lang && form.lang['de']"
          :is-valid.sync="isValid"
          :error-messages.sync="errorMessages"
          class="mb-8"
        />
        <div class="mx-auto" style="max-width:800px; width:100%;">
          <v-dialog v-if="form.objectData" v-model="deleteDialog" persistent max-width="290">
            <v-card>
              <v-card-title class="headline" />
              <v-card-text>
                {{
                  $t('unit.data.deleteobject', {
                    object: `${form.objectData.name} ${form.objectData.id}`
                  })
                }}
              </v-card-text>
              <v-card-actions>
                <v-btn text @click="deleteDialog = false">{{ $t('global.button.cancel') }}</v-btn>
                <v-spacer />
                <v-btn text @click="deleteObject">{{ $t('global.button.delete') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

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
import { IForm } from '~/lib/utils'
import { IValidationErrorMessage } from '~/pages/_unit/forms/_form/_object.vue'
import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'
import VeoPage from '~/components/layout/VeoPage.vue'
import VeoTabs from '~/components/layout/VeoTabs.vue'

import VeoForm from '~/components/forms/VeoForm.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { getSchemaName } from '~/plugins/api/schema'
import object from '~/plugins/api/object'
import { capitalize } from 'lodash'

interface IData {
  panel: number[]
  deleteDialog: boolean
  form: IForm
  isValid: boolean
  errorMessages: IValidationErrorMessage[]
  saveBtnLoading: boolean
  deleteBtnLoading: boolean
  error?: Error & { status?: number }
}

export default Vue.extend({
  components: {
    VeoForm,
    VeoPageWrapper,
    VeoPage,
    VeoTabs
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
      error: undefined
    }
  },
  async fetch() {
    const objectSchema = await this.$api.schema.fetch(this.schemaType)
    const { lang } = await this.$api.translation.fetch(['de', 'en'])
    const objectData = await this.$api.object.fetch(this.$route.params.type, this.objectId)
    this.form = {
      objectSchema,
      objectData,
      lang
    }
  },
  head(): any {
    return {
      title: this.title
    }
  },
  computed: {
    title(): string {
      return this.$fetchState.pending
        ? 'veo.Objects'
        : `${this.form.objectData.name} - ${capitalize(this.schemaType)} - veo.Objects`
    },
    schemaType(): string | undefined {
      return getSchemaName(this.$route.params.type)
    },
    objectGroup(): string {
      return this.$route.params.group
    },
    objectId(): string {
      return this.$route.params.id
    },
    unit(): String {
      return this.$route.params.unit
    },
    linkToLinks(): string {
      return `/${this.unit}/objects/${this.schemaType}/${this.objectGroup}/${this.objectId}/links`
    },
    linkToHistory(): string {
      return `/${this.unit}/objects/${this.schemaType}/${this.objectGroup}/${this.objectId}/history`
    }
  },
  methods: {
    showDeleteDialog() {
      this.deleteDialog = true
    },
    async onClick() {
      this.saveBtnLoading = true
      this.error = undefined
      try {
        this.formatObjectData()
        if (this.$route.params.type) {
          await this.action(this.$route.params.type)
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
        this.saveBtnLoading = false
      }
    },
    async action(objectType: string) {
      await this.save(objectType)
    },
    async save(objectType: string) {
      await this.$api.object.update(this.$route.params.type, this.objectId, this.form.objectData)
    },
    async deleteObject() {
      this.deleteDialog = false
      this.deleteBtnLoading = true
      try {
        await this.$api.object.delete(this.$route.params.type, this.$route.params.id)
        this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('global.appstate.alert.success') })
        this.$router.push({
          path: `/${this.unit}/objects/${this.schemaType}/${this.objectGroup}/`
        })
      } catch (e) {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          title: this.$t('global.appstate.alert.error'),
          text: e
        })
      }
      this.deleteBtnLoading = false
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
