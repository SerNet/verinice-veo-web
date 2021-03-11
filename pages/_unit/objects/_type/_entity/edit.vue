<template>
  <VeoPageWrapper>
    <template #default>
      <VeoPage absolute-size :cols="12" :md="8" :xl="8" sticky-header :title="objectTitle">
        <template #default>
          <v-row class="justify-space-between">
            <v-col cols="auto">
              <v-btn-toggle mandatory :value="2" color="primary" dense>
                <v-tooltip bottom>
                  <template #activator="{on}">
                    <v-btn v-on="on" @click="navigateList()">
                      <v-icon>mdi-menu</v-icon>
                    </v-btn>
                  </template>
                  <template #default>
                    {{ $t('list_view') }}
                  </template>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{on}">
                    <v-btn v-on="on" @click="navigateTree()">
                      <v-icon>mdi-file-tree</v-icon>
                    </v-btn>
                  </template>
                  <template #default>
                    {{ $t('tree_view') }}
                  </template>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{on}">
                    <v-btn v-on="on">
                      <v-icon>mdi-file</v-icon>
                    </v-btn>
                  </template>
                  <template #default>
                    {{ $t('detail_view') }}
                  </template>
                </v-tooltip>
              </v-btn-toggle>
            </v-col>
            <v-col cols="auto" class="mr-4">
              <v-btn color="primary" outlined :disabled="$fetchState.pending" :loading="saveBtnLoading" @click="save()">
                {{ $t('global.button.save') }}
              </v-btn>
            </v-col>
          </v-row>
          <div v-if="$fetchState.pending" class="fill-width fill-height d-flex justify-center align-center">
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
            />
            <VeoAlert
              v-model="alert.value"
              v-bind="alert"
              style="position: fixed; width: 60%; bottom: 0; left: 20%; z-index: 1"
            >
              <template #additional-button>
                <v-btn outlined text color="error" @click="$fetch()">{{ $t('global.button.yes') }}</v-btn>
              </template>
            </VeoAlert>
          </div>
        </template>
      </VeoPage>
      <VeoPage absolute-size :cols="12" :md="4" :xl="4">
        <VeoTabs>
          <template #tabs>
            <v-tab disabled>{{ $t('unit.data.history') }}</v-tab>
          </template>
        </VeoTabs>
        <VeoObjectHistory :object="form.objectData" />
      </VeoPage>
    </template>
  </VeoPageWrapper>
</template>
<i18n>
{
  "en": {
    "detail_view": "Detail view",
    "edit_object": "Edit {title}",
    "list_view": "List view",
    "tree_view": "Tree view"
  },
  "de": {
    "detail_view": "Detailansicht",
    "edit_object": "{title} bearbeiten",
    "list_view": "Listenansicht",
    "tree_view": "Baumansicht"
  }
}
</i18n>
<script lang="ts">
import Vue from 'vue'
import { IForm, separateUUIDParam } from '~/lib/utils'
import { IValidationErrorMessage } from '~/pages/_unit/forms/_form/_object.vue'
import VeoPage from '~/components/layout/VeoPage.vue'
import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'
import VeoTabs from '~/components/layout/VeoTabs.vue'
import VeoObjectHistory from '~/components/objects/VeoObjectHistory.vue'

import VeoForm from '~/components/forms/VeoForm.vue'
import { VeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents'
import { getSchemaName } from '~/plugins/api/schema'
import { capitalize } from 'lodash'
import { IVeoAPIMessage } from '~/types/VeoTypes'

interface IData {
  form: IForm
  isValid: boolean
  errorMessages: IValidationErrorMessage[]
  saveBtnLoading: boolean
  alert: VeoEventPayload & { value: boolean }
}

export default Vue.extend({
  components: {
    VeoForm,
    VeoPage,
    VeoPageWrapper,
    VeoTabs,
    VeoObjectHistory
  },
  data(): IData {
    return {
      form: {
        objectSchema: {},
        objectData: {},
        lang: {}
      },
      isValid: true,
      errorMessages: [],
      saveBtnLoading: false,
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
    const objectData = await this.$api.entity.fetch(this.$route.params.type, this.$route.params.entity)
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
        : `Objekt erstellen - ${capitalize(this.schemaType)} - ${this.$t('breadcrumbs.objects')}`
    },
    objectTitle(): string {
      return this.$t('edit_object', {
        title: this.$fetchState.pending ? this.formattedSchemaType : this.form.objectData.name
      })
    },
    schemaType(): string | undefined {
      return getSchemaName(this.schemaEndpoint || '')
    },
    schemaEndpoint(): string | undefined {
      return this.$route.params.type
    },
    formattedSchemaType(): string {
      return capitalize(this.schemaType)
    },
    parent(): string {
      return this.$route.params.entity
    },
    unitID(): string {
      return separateUUIDParam(this.$route.params.unit).id
    },
    objectID(): string {
      return separateUUIDParam(this.$route.params.entity).id
    }
  },
  methods: {
    async save() {
      this.saveBtnLoading = true
      this.formatObjectData()

      await this.$api.entity
        .update(this.schemaEndpoint, this.objectID, this.form.objectData)
        .then(async (data: IVeoAPIMessage) => {
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('unit.data.saved') })

          if (this.parent !== '-') {
            const parent = await this.$api.entity.fetch(this.schemaEndpoint, this.parent)
            parent.parts.push({
              targetUri: `${this.$config.apiUrl}/${this.schemaEndpoint}/${data.resourceId}`
            })
            this.$api.entity.update(this.schemaEndpoint, parent.id, parent).finally(() => {
              this.$router.push(`/${this.$route.params.unit}/objects/${this.schemaEndpoint}/${this.parent}/list`)
            })
          } else {
            this.$router.push(`/${this.$route.params.unit}/objects/${this.schemaEndpoint}/${this.parent}/list`)
          }
        })
        .catch(() => {
          this.alert.value = true
        })
        .finally(() => {
          this.saveBtnLoading = false
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
    },
    navigateTree() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/tree`
      )
    },
    navigateList() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/list`
      )
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
