<template>
  <v-row no-gutters>
    <v-col class="flex-shrink-0 flex-grow-1 pa-3">
      <div v-if="$fetchState.pending" class="text-center ma-12">
        <v-progress-circular indeterminate color="primary" size="50" />
      </div>
      <div v-if="!$fetchState.pending && form.objectData">
        <div class="my-3">
          <v-btn color="primary" :to="linkToLinks" dark>Links</v-btn>
          <v-btn color="primary" :to="linkToHistory" dark>History</v-btn>
        </div>

        <div class="my-3">
          <div class="display-1">{{ form.objectData.name }}</div>
          <div class="display mb-3">{{ form.objectData.id }}</div>
        </div>

        <!-- <pre class="mb-3"><code class="language-json" v-html="" /></pre> -->
        <veo-form v-if="!$fetchState.pending" v-model="form.objectData" :schema="form.objectSchema" :lang="form.lang && form.lang['de']" />

        <div style="width:800px">
          <v-btn color="primary" :loading="saveBtnLoading" @click="save">Speichern</v-btn>
          <v-dialog v-if="form.objectData" v-model="deleteDialog" persistent max-width="290">
            <template v-slot:activator="{ on, attrs }">
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
      </div>
    </v-col>

    <AppSideContainer :width="350">
      <nuxt-child />
    </AppSideContainer>

    <AppTabBar :items="navItems" :drawer="false" right />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
import { IBaseObject, IForm } from '@/lib/utils'
import AppTabBar from '~/components/layout/AppTabBar.vue'
import AppSideContainer from '~/components/layout/AppSideContainer.vue'
import AppStateAlert from '@/components/AppStateAlert.vue'

type APIGroup = 'asset' | 'control' | 'person' | 'process' | 'unit'

interface IData {
  deleteDialog: boolean
  form: IForm
  state: string
  saveBtnLoading: boolean
  deleteBtnLoading: boolean
}

export default Vue.extend({
  middleware({ route, params, redirect }) {
    // TODO Nur weiterleiten, wenn Desktop
    if (route.name === 'unit-data-type-group-id') {
      return redirect(`/${params.unit}/data/${params.type}/${params.group}/${params.id}/links`)
    }
  },
  validate({ params }) {
    return ['asset', 'control', 'person', 'process', 'unit'].includes(params.type)
  },
  components: {
    AppTabBar,
    AppSideContainer,
    AppStateAlert
  },
  props: {},
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
  data(): IData {
    return {
      deleteDialog: false,
      form: {
        objectSchema: {},
        objectData: {},
        lang: {}
      },
      state: 'start',
      saveBtnLoading: false,
      deleteBtnLoading: false
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
        await this.$api[this.objectType].update(this.$route.params.object, this.form.objectData)
        this.state = 'success'
      } catch (e) {
        this.state = 'error'
      }
      this.saveBtnLoading = false
    }
  },
  head(): any {
    return {
      title: 'veo.data'
    }
  }
})
</script>

<style lang="scss" scoped>
code {
  padding: 0;
  width: 100%;
  display: block;
}
::v-deep {
  .vf-wrapper.flex-column > .vf-layout.mx-auto {
    margin: 0 !important;
  }
}
</style>
