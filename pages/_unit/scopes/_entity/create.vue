<template>
  <div v-if="$fetchState.pending" class="fill-width fill-height d-flex justify-center align-center">
    <v-progress-circular indeterminate color="primary" size="50" />
  </div>
  <VeoPage v-else-if="!!entityType" absolute-size fullsize sticky-header>
    <template #header>
      <v-row>
        <v-col>
          <h1>{{ $t('object_create', { type: formattedEntityType }) }}</h1>
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
        :general-translation="form.lang && form.lang[$i18n.locale]"
        :is-valid.sync="isValid"
        :error-messages.sync="errorMessages"
        class="mb-8"
        @input="entityModified.isModified = true"
      />
      <VeoEntityModifiedDialog
        v-model="entityModified.dialog"
        :item="form.objectData"
        @exit="$router.push(entityModified.target)"
      />
    </template>
  </VeoPage>
  <VeoPage v-else fullsize>
    <template #default>
      <v-row class="fill-height flex-column text-center align-center">
      <v-spacer />
      <v-col>
        <v-icon style="font-size: 8rem; opacity: 0.5;" color="primary">mdi-information-outline</v-icon>
      </v-col>
      <v-col cols="auto" class="text-left">
        <h3>{{ $t('error.title') }}:</h3>
        <p>{{ $t('no_type') }}</p>
        <nuxt-link :to="backLink">{{ $t('global.button.previous') }}</nuxt-link>
      </v-col>
      <v-spacer />
    </v-row>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router/types/index'

import { IForm, separateUUIDParam } from '~/lib/utils'
import { IValidationErrorMessage } from '~/pages/_unit/forms/_form/_entity.vue'
import VeoPage from '~/components/layout/VeoPage.vue'

import VeoEntityModifiedDialog from '~/components/objects/VeoEntityModifiedDialog.vue'
import VeoForm from '~/components/forms/VeoForm.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { getSchemaEndpoint } from '~/plugins/api/schema'
import { capitalize } from 'lodash'
import { IVeoAPIMessage } from '~/types/VeoTypes'

interface IData {
  form: IForm
  isValid: boolean
  errorMessages: IValidationErrorMessage[]
  saveBtnLoading: boolean
  entityModified: {
    isModified: boolean
    dialog: boolean
    target?: Route
  }
}

export default Vue.extend({
  name: 'VeoScopesCreatePage',
  components: {
    VeoForm,
    VeoPage,
    VeoEntityModifiedDialog
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
      entityModified: {
        isModified: false,
        dialog: false,
        target: undefined
      }
    }
  },
  async fetch() {
    if(this.entityType) {
      const objectSchema = await this.$api.schema.fetch(this.entityType.toLowerCase())
      const { lang } = await this.$api.translation.fetch(['de', 'en'])
      const objectData = {}
      this.form = {
        objectSchema,
        objectData,
        lang
      }
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
        ? this.$t('breadcrumbs.scopes')
        : `${this.$t('object_create', { type: this.formattedEntityType })} - ${this.$t('breadcrumbs.scopes')}`
    },
    parentId(): string {
      return separateUUIDParam(this.$route.params.entity).id
    },
    parentType(): string {
      return separateUUIDParam(this.$route.params.entity).type.toLowerCase()
    },
    unitID(): string {
      return separateUUIDParam(this.$route.params.unit).id
    },
    entityType(): string {
      return this.$route.query.based_on.toLowerCase()
    },
    formattedEntityType(): string {
      return capitalize(this.entityType)
    },
    backLink(): string {
      const url = this.$route.fullPath.split('/')
      url.pop()
      return url.join('/')
    }
  },
  methods: {
    async save() {
      this.saveBtnLoading = true
      this.formatObjectData()

      await this.$api.entity
        .create(this.entityType, {
          ...this.form.objectData,
          owner: {
            targetUri: `/units/${this.unitID}`
          }
        })
        .then(async (data: IVeoAPIMessage) => {
          this.entityModified.isModified = false
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('object_saved') })
          if (this.parentId !== '-') {
            const parent = await this.$api.entity.fetch(this.parentType, this.parentId)

            if(this.parentType === 'scope') {
              parent.members.push({
                targetUri: `/${ getSchemaEndpoint(this.entityType) }/${data.resourceId}`
              })
            } else {
              parent.parts.push({
                targetUri: `/${ getSchemaEndpoint(this.entityType) }/${data.resourceId}`
              })
            }
            
            this.$api.entity.update(this.parentType, parent.id, parent).finally(() => {
              this.$router.push(this.backLink)
            })
          } else {
            this.$router.push(this.backLink)
          }
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
  },
  beforeRouteLeave(to: Route, _from: Route, next: Function) {
    // If the form was modified and the dialog is open, the user wanted to proceed with his navigation
    if(this.entityModified.isModified && this.entityModified.dialog) {
      next()
    } else if (this.entityModified.isModified) { // If the form was modified and the dialog is closed, show it and abort navigation
      this.entityModified.target = to
      this.entityModified.dialog = true
      next(false)
    } else { // The form wasn't modified, proceed as if this hook doesn't exist
      next()
    }
  }
})
</script>

<i18n>
{
  "en": {
    "no_type": "There is no type set for the new object. Please try again.",
    "object_create": "Create {type}",
    "object_saved": "Object saved successfully"
  },
  "de": {
    "no_type": "Es wurde kein Typ für das neue Objekt festgelegt. Bitte versuchen Sie es erneut.",
    "object_create": "{type} erstellen",
    "object_saved": "Objekt wurde gespeichert!"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
