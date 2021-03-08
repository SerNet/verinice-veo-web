<template>
  <div v-if="$fetchState.pending" class="fill-width fill-height d-flex justify-center align-center">
    <v-progress-circular indeterminate color="primary" size="50" />
  </div>
  <VeoPage v-else absolute-size :cols="8" :md="8" :xl="8" sticky-header>
    <template #header>
      <v-row>
        <v-col>
          <h1>{{ formattedSchemaType }} erstellen</h1>
        </v-col>
        <v-spacer />
        <v-col class="text-right">
          <v-btn color="primary" outlined text :loading="saveBtnLoading" @click="save()">
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
</template>
<i18n>
{
  "de": {
    "object_create": "Objekt erstellen"
  },
  "en": {
    "object_create": "Create object"
  }
}
</i18n>

<script lang="ts">
import Vue from 'vue'
import { IForm, separateUUIDParam } from '~/lib/utils'
import { IValidationErrorMessage } from '~/pages/_unit/forms/_form/_object.vue'
import VeoPage from '~/components/layout/VeoPage.vue'

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
  alert: VeoEventPayload & { value: boolean, error: number }
}

export default Vue.extend({
  components: {
    VeoForm,
    VeoPage
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
        saveButtonText: this.$t('global.button.no') as string,
        error: 0 as number
      }
    }
  },
  async fetch() {
    const objectSchema = await this.$api.schema.fetch(this.schemaType)
    const { lang } = await this.$api.translation.fetch(['de', 'en'])
    const objectData = {}
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
        : `${this.$t('object_create')} - ${capitalize(this.schemaType)} - ${this.$t('breadcrumbs.objects')}`
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
      return separateUUIDParam(this.$route.params.entity).id
    },
    unitID(): string {
      return separateUUIDParam(this.$route.params.unit).id
    }
  },
  methods: {
    async save() {
      this.saveBtnLoading = true
      this.formatObjectData()

      await this.$api.entity
        .create(this.schemaEndpoint, {
          ...this.form.objectData,
          owner: {
            targetUri: `/units/${this.unitID}`
          }
        })
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
        }).catch((error: { status: number; name: string }) => {
          this.alert.text = error.name
          this.alert.saveButtonText = this.$t('global.button.ok') as string
          this.alert.error = 0
          this.alert.value = true
        }).finally(() => {
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

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
