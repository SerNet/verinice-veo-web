<template>
  <VeoPageWrapper>
    <template #default>
      <VeoPage absolute-size :cols="12" :md="8" :xl="8" sticky-header :title="objectTitle">
        <template #default>
          <VeoEntityDisplayOptions :rootRoute="`/${$route.params.unit}/scopes`" :current-entity="form.objectData">
            <v-btn color="primary" outlined :disabled="$fetchState.pending" :loading="saveBtnLoading" @click="save()">
              {{ $t('global.button.save') }}
            </v-btn>
          </VeoEntityDisplayOptions>
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

<script lang="ts">
import Vue from 'vue'
import { upperFirst } from 'lodash'
import { IForm, separateUUIDParam } from '~/lib/utils'
import { IValidationErrorMessage } from '~/pages/_unit/forms/_form/_entity.vue'
import VeoPage from '~/components/layout/VeoPage.vue'
import VeoPageWrapper from '~/components/layout/VeoPageWrapper.vue'
import VeoTabs from '~/components/layout/VeoTabs.vue'
import VeoObjectHistory from '~/components/objects/VeoObjectHistory.vue'
import VeoEntityDisplayOptions from '~/components/objects/VeoEntityDisplayOptions.vue'

import VeoForm from '~/components/forms/VeoForm.vue'
import { VeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents'
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
    VeoObjectHistory,
    VeoEntityDisplayOptions
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
        title: this.$fetchState.pending ? this.formattedEntityType : this.form.objectData.name
      })
    },
    entityId(): string {
      return separateUUIDParam(this.$route.params.entity).id
    },
    entityType(): string {
      return separateUUIDParam(this.$route.params.entity).type
    },
    formattedEntityType(): string {
      return upperFirst(this.entityType)
    }
  },
  methods: {
    save() {
      this.saveBtnLoading = true
      this.formatObjectData()

      this.$api.entity
        .update(this.entityType, this.entityId, this.form.objectData)
        .then(async (_data: IVeoAPIMessage) => {
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('unit.data.saved') })

          this.$router.back()
        })
        .catch((error: { status: number; name: string }) => {
          this.alert.text = error.status === 412 ? this.$t('unit.forms.nrr') : ''
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
    }
  }
})
</script>

<i18n>
{
  "en": {
    "edit_object": "Edit \"{title}\"",
    "object_add": "Link object",
    "object_create": "Create object",
    "scope_add": "Link scope",
    "scope_create": "Create scope"
  },
  "de": {
    "edit_object": "\"{title}\" bearbeiten",
    "object_add": "Objekt verknüpfen",
    "object_create": "Objekt erstellen",
    "scope_add": "Scope verknüpfen",
    "scope_create": "Scope erstellen"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
