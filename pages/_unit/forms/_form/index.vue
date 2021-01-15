<template>
  <VeoPage title="veo.Forms">
    <template #title>
      <v-spacer />
      <v-btn
        depressed
        text
        outlined
        :to="`/${unit}/forms/${formType}/create`"
        color="primary"
        class="align-self-center"
      >
        {{ $t('unit.forms.create', { type: objectType }) }}
      </v-btn>
    </template>
    <template #default>
      <v-data-table
        :headers="headers"
        :items="objects"
        :items-per-page="20"
        :no-data-text="`Keine {types} vorhanden!`"
        :loading-text="`{types} werden geladen...`"
        :loading="$fetchState.pending"
        @click:row="goToObject"
      >
        <template #top>
          <v-row dense>
            <v-col :cols="3">
              <v-select v-model="formType" label="Formular" :items="formTypes" outlined dense @input="changeType()" />
            </v-col>
            <v-col :cols="3">
              <v-select
                v-model="group"
                label="Group"
                :items="groups"
                item-text="title"
                item-value="id"
                outlined
                dense
              />
            </v-col>
            <v-col :cols="6">
              <v-text-field label="Title" outlined dense />
            </v-col>
          </v-row>
        </template>
        <template #item.name="{ value }">
          <span class="font-weight-bold">{{ value }}</span>
        </template>
        <template #item.actions="{ item }">
          <v-icon small class="mr-2">
            mdi-pencil
          </v-icon>
          <v-icon small>
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'

import VeoPage from '~/components/layout/VeoPage.vue'
import { IBaseObject } from '~/lib/utils'
import { FormSchema, FormSchemaMeta, FormSchemaMetas } from '~/types/FormSchema'

interface IData {
  formSchema: FormSchema | undefined
  objectType: string | undefined
  objects: IBaseObject[]
  formType: string
  formTypes: { value: string; text: string }[]
  group: string
  groups: { value: string; text: string }[]
  headers: any
}

export default Vue.extend({
  components: {
    VeoPage
  },
  data(): IData {
    return {
      formSchema: undefined,
      objectType: '',
      objects: [],
      formType: this.$route.params.form,
      formTypes: [],
      group: '-',
      groups: [],
      headers: [
        {
          text: 'Title',
          value: 'name'
        },
        {
          text: 'UUID',
          value: 'id',
          sortable: false
        },
        {
          text: 'Created at',
          value: null
        },
        {
          text: 'Updated at',
          value: null
        },
        {
          text: '',
          value: 'actions',
          sortable: false
        }
      ]
    }
  },
  async fetch() {
    this.formSchema = await this.$api.form.fetch(this.$route.params.form)
    this.objectType = this.formSchema && this.formSchema.modelType.toLowerCase()
    this.objects =
      this.objectType &&
      (await this.$api[this.objectType].fetchAll({
        unit: this.$route.params.unit
      }))

    this.formTypes = await this.$api.form
      .fetchAll({ unit: this.$route.params.unit })
      .then((formTypes: FormSchemaMetas) =>
        formTypes.map((entry: FormSchemaMeta) => {
          return {
            text: entry.name,
            value: entry.id
          }
        })
      )
  },
  head() {
    return {
      title: 'veo.forms'
    }
  },
  computed: {
    unit() {
      return this.$route.params.unit
    }
  },
  methods: {
    goToObject(item: any) {
      this.$router.push(`/${this.unit}/forms/${this.formType}/${item.id}`)
    },
    changeType() {
      this.$router.push(`/${this.unit}/forms/${this.formType}`)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.v-data-table ::v-deep tbody {
  cursor: pointer;
}
</style>
