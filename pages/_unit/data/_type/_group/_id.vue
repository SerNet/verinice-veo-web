<template>
  <v-row no-gutters>
    <v-col class="pa-3">
      <template v-if="$fetchState.pending">
        <div class="text-center ma-12">
          <v-progress-circular indeterminate color="primary" size="50" />
        </div>
      </template>

      <template v-if="!$fetchState.pending && form.objectData">
        <div class="mx-auto pa-3" style="max-width:800px; width:100%;">
          <v-btn color="primary" :to="linkToLinks" dark>Links</v-btn>
          <v-btn color="primary" :to="linkToHistory" dark>History</v-btn>

          <div class="display-1 mt-3">{{ form.objectData.name }}</div>
          <div class="display mb-3">{{ form.objectData.id }}</div>
        </div>

        <VeoForm v-model="form.objectData" :schema="form.objectSchema" :lang="form.lang && form.lang['de']" :is-valid.sync="isValid" :error-messages.sync="errorMessages" />

        <div class="mx-auto pa-3" style="max-width:800px; width:100%;">
          <v-expansion-panels v-model="panel" hover focusable multiple class="mx-auto my-3">
            <v-expansion-panel>
              <v-expansion-panel-header>objectData</v-expansion-panel-header>
              <v-expansion-panel-content style="overflow:auto">
                <pre>{{ JSON.stringify(form.objectData, null, 4) }}</pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>Validation logs</v-expansion-panel-header>
              <v-expansion-panel-content style="overflow:auto">
                <div>isValid: {{ isValid }}</div>
                <div>Error Messages:</div>
                <pre>{{ errorMessages }}</pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-btn color="primary" :loading="saveBtnLoading" @click="save">Speichern</v-btn>
          <v-dialog v-if="form.objectData" v-model="deleteDialog" persistent max-width="290">
            <template #activator="{ on, attrs }">
              <v-btn color="primary" dark :loading="deleteBtnLoading" v-bind="attrs" v-on="on">
                Löschen
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="headline" />
              <v-card-text>Soll das Objekt {{ form.objectData.name }} ({{ form.objectData.id }}) wirklich gelöscht werden?</v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text @click="deleteDialog = false">Abbrechen</v-btn>
                <v-btn text @click="deleteObject">Löschen</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <AppStateAlert v-model="state" state-after-alert="start" />
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
  deleteBtnLoading: boolean
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
      deleteBtnLoading: false
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
    async save() {
      this.saveBtnLoading = true
      try {
        // TODO: find better solution
        //  Add Keys and IDs manually
        Object.keys(this.form.objectData.customAspects).forEach((key: string) => {
          this.form.objectData.customAspects[key] = { ...this.form.objectData.customAspects[key], id: '00000000-0000-0000-0000-000000000000', type: key }
        })
        await this.$api[this.objectType].update(this.objectId, this.form.objectData)
        this.state = 'success'
      } catch (e) {
        this.state = 'error'
      }
      this.saveBtnLoading = false
    }
  }
})
</script>

<style lang="scss" scoped></style>
