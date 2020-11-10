<template>
  <v-row no-gutters>
    <v-col class="pa-3">
      <template v-if="$fetchState.pending">
        <div class="text-center ma-12">
          <v-progress-circular indeterminate color="primary" size="50" />
        </div>
      </template>

      <template v-if="!$fetchState.pending && form.objectData">
        <div class="mx-auto" style="max-width:800px; width:100%;">
          <v-btn color="primary" :to="linkToLinks" dark>{{ $t('unit.data.links') }}</v-btn>
          <v-btn color="primary" :to="linkToHistory" dark>{{ $t('unit.data.history') }}</v-btn>

          <div class="display-1 mt-3">{{ form.objectData.name }}</div>
          <div class="display mb-3">{{ form.objectData.id }}</div>
        </div>

        <VeoForm v-model="form.objectData" :schema="form.objectSchema" :lang="form.lang && form.lang['de']" :is-valid.sync="isValid" :error-messages.sync="errorMessages" />

        <div class="mx-auto" style="max-width:800px; width:100%;">
          <v-expansion-panels v-model="panel" hover focusable multiple class="mx-auto my-3">
            <v-expansion-panel>
              <v-expansion-panel-header>{{ $t('unit.data.objectdata') }}</v-expansion-panel-header>
              <v-expansion-panel-content style="overflow:auto">
                <pre>{{ JSON.stringify(form.objectData, null, 4) }}</pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>{{ $t('unit.data.validationlogs') }}</v-expansion-panel-header>
              <v-expansion-panel-content style="overflow:auto">
                <div>{{ $t('unit.data.valid') }}: {{ isValid }}</div>
                <div>{{ $t('unit.data.errormessages') }}:</div>
                <pre>{{ errorMessages }}</pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-btn color="primary" :loading="saveBtnLoading" @click="onClick">{{ $t('global.button.save') }}</v-btn>
          <v-dialog v-if="form.objectData" v-model="deleteDialog" persistent max-width="290">
            <template #activator="{ on, attrs }">
              <v-btn color="primary" dark :loading="deleteBtnLoading" v-bind="attrs" v-on="on">
                {{ $t('global.button.delete') }}
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="headline" />
              <v-card-text>{{ $t('unit.data.deleteobject', {object: `${form.objectData.name} ${form.objectData.id}`}) }}</v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text @click="deleteDialog = false">{{ $t('global.button.cancel') }}</v-btn>
                <v-btn text @click="deleteObject">{{ $t('global.button.delete') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <AppStateAlert v-model="state" :error="error || $fetchState.error" state-after-alert="start" />
          <AppStateDialog v-if="error && error.status == 412" :value="!!error" title="Fehler" @input="error = undefined" @yes="$fetch">
            <template v-if="error">
              <span v-if="error && error.status == 412">{{ $t('unit.forms.nrr') }}</span>
              <span v-else v-text="error" />
            </template>
          </AppStateDialog>
        </div>
      </template>
    </v-col>

    <AppSideContainer :width="350">
      <nuxt-child />
    </AppSideContainer>

    <AppTabBar :items="navItems" :drawer="false" right />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
import { IBaseObject, IForm } from '~/lib/utils'
import AppTabBar from '~/components/layout/AppTabBar.vue'
import AppSideContainer from '~/components/layout/AppSideContainer.vue'
import AppStateAlert from '~/components/AppStateAlert.vue'
import { IValidationErrorMessage } from '~/pages/_unit/forms/_form/_object.vue'
import VeoForm from '~/components/forms/VeoForm.vue'

type APIGroup = 'asset' | 'control' | 'person' | 'process'

interface IData {
  panel: number[]
  deleteDialog: boolean
  form: IForm
  isValid: boolean
  errorMessages: IValidationErrorMessage[]
  state: string
  saveBtnLoading: boolean
  deleteBtnLoading: boolean,
  error?: Error & { status?: number },
  btnLoading: boolean
}

export default Vue.extend({
  components: {
    AppTabBar,
    AppSideContainer,
    AppStateAlert,
    VeoForm
  },
  middleware({ route, params, redirect }) {
    // TODO Nur weiterleiten, wenn Desktop
    if (route.name === 'unit-data-type-group-id') {
      return redirect(`/${params.unit}/data/${params.type}/${params.group}/${params.id}/links`)
    }
  },
  validate({ params }) {
    return ['asset', 'control', 'person', 'process'].includes(params.type)
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
      state: 'start',
      saveBtnLoading: false,
      deleteBtnLoading: false,
      error: undefined,
      btnLoading: false
    }
  },
  async fetch() {
    const objectSchema = await this.$api.schema.fetch(this.objectType)
    const { lang } = await this.$api.translation.fetch(['de', 'en'])
    const objectData = await this.$api[this.objectType].fetch(this.objectId)
    this.form = {
      objectSchema,
      objectData,
      lang
    }
  },
  head(): any {
    return {
      title: 'veo.data'
    }
  },
  computed: {
    objectType(): APIGroup {
      return this.$route.params.type as APIGroup
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
      return `/${this.unit}/data/${this.objectType}/${this.objectGroup}/${this.objectId}/links`
    },
    linkToHistory(): string {
      return `/${this.unit}/data/${this.objectType}/${this.objectGroup}/${this.objectId}/history`
    },
    navItems(): Array<Object> {
      return [
        {
          name: 'Links',
          icon: 'mdi-link',
          to: this.linkToLinks
        },
        {
          name: 'History',
          icon: 'mdi-history',
          to: this.linkToHistory
        }
      ]
    }
  },
  methods: {
    async onClick() {
      this.btnLoading = true
      this.error = undefined
      try {
        this.formatObjectData()
        if (this.objectType) {
          await this.action(this.objectType)
        } else {
          throw new Error('Object Type is not defined in FormSchema')
        }
        this.state = 'success'
        this.$fetch()
      } catch (e) {
        this.state = 'error'
        this.error = e
        console.error(e)
      } finally {
        this.btnLoading = false
      }
    },
    async action(objectType: APIGroup) {
      await this.save(objectType)
    },
    async save(objectType: APIGroup) {
      await this.$api[objectType].update(this.objectId, this.form.objectData)
    },
    async deleteObject() {
      this.deleteDialog = false
      this.deleteBtnLoading = true
      try {
        await this.$api[this.objectType].delete(this.$route.params.id)
        this.state = 'success'
        this.$router.push({ path: `/${this.unit}/data/${this.objectType}/${this.objectGroup}/` })
      } catch (e) {
        this.state = 'error'
      }
      this.deleteBtnLoading = false
    },
    formatObjectData() {
      // TODO: find better solution
      //  Add Keys and IDs manually
      if (this.form.objectData.customAspects) {
        Object.keys(this.form.objectData.customAspects).forEach((key: string) => {
          this.form.objectData.customAspects[key] = { ...this.form.objectData.customAspects[key], id: '00000000-0000-0000-0000-000000000000', type: key }
        })
      }
    }
  }
})
</script>

<style lang="scss" scoped></style>
