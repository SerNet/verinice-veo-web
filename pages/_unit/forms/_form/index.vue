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
        {{ $t('unit.forms.create', { type: formName }) }}
      </v-btn>
    </template>
    <template #default>
      <v-data-table
        :headers="headers"
        :items="displayedObjects"
        :items-per-page="20"
        :no-data-text="$t('unit.forms.noentries', { types: formName })"
        :loading-text="$t('unit.forms.loading', { types: formName })"
        :loading="$fetchState.pending"
      >
        <template #top>
          <v-row dense>
            <v-col :cols="12" :md="3">
              <v-select
                v-model="formType"
                :label="$t('unit.forms.form')"
                :items="formTypes"
                outlined
                dense
                @input="changeType()"
              />
            </v-col>
            <v-col :cols="9">
              <v-text-field :label="$t('unit.forms.search')" outlined dense style="visibility: hidden" />
            </v-col>
          </v-row>
        </template>
        <template #item.name="{ value }">
          <span class="table--title-cell">{{ value }}</span>
        </template>
        <template #item.description="{ value }">
          <span class="table--description-cell">{{ value }}</span>
        </template>
        <template #item.updatedAt="{ value }">
          {{ new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}<br />
          {{ new Date(value).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }}
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex flex-row">
            <v-btn icon @click="doEdit(item)">
              <v-icon>
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-btn icon @click="doDuplicate(item)">
              <v-icon>
                mdi-content-copy
              </v-icon>
            </v-btn>
            <v-btn icon @click="showDelete(item)">
              <v-icon>
                mdi-delete
              </v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
      <DeleteFormDialog v-model="deleteDialog.value" :form="deleteDialog.item" @delete="doDelete" />
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'

import VeoPage from '~/components/layout/VeoPage.vue'
import { IBaseObject } from '~/lib/utils'
import { endpoints, getSchemaEndpoint } from '~/plugins/api/schema'
import { FormSchema, FormSchemaMeta, FormSchemaMetas } from '~/types/FormSchema'
import DeleteFormDialog from '~/components/dialogs/DeleteFormDialog.vue'

interface IData {
  formSchema: FormSchema | undefined
  objectType: string | undefined
  objects: IBaseObject[]
  formType: string
  formTypes: { value: string; text: string }[]
  headers: any
  deleteDialog: { value: boolean; item: any }
}

export default Vue.extend({
  components: {
    VeoPage,
    DeleteFormDialog
  },
  data(): IData {
    return {
      formSchema: undefined,
      objectType: '',
      objects: [],
      formType: this.$route.params.form,
      formTypes: [],
      headers: [
        {
          text: this.$t('unit.forms.header.abbreviation'),
          value: 'abbreviation'
        },
        {
          text: this.$t('unit.forms.header.title'),
          value: 'name'
        },
        {
          text: this.$t('unit.forms.header.description'),
          value: 'description',
          sortable: false
        },
        {
          text: this.$t('unit.forms.header.updatedby'),
          value: 'updatedBy'
        },
        {
          text: this.$t('unit.forms.header.updatedat'),
          value: 'updatedAt'
        },
        {
          text: '',
          value: 'actions',
          sortable: false
        }
      ],
      deleteDialog: { value: false, item: undefined }
    }
  },
  async fetch() {
    this.formSchema = await this.$api.form.fetch(this.$route.params.form)
    this.objectType = this.formSchema && this.formSchema.modelType.toLowerCase()
    if (this.formSchema) {
      // @ts-ignore
      this.objectType = endpoints[this.formSchema.modelType.toLowerCase()]

      this.objects = await this.$api.object.fetchAll(this.objectType, {
        unit: this.$route.params.unit
      })
    } else {
      this.objects = []
    }

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
      title: 'veo.Forms'
    }
  },
  computed: {
    unit() {
      return this.$route.params.unit
    },
    displayedObjects(): IBaseObject[] {
      return this.objects.filter(
        (object: IBaseObject) => !this.formSchema || object.subType[this.currentDomain] === this.formSchema.subType
      )
    },
    formName(): string {
      return this.formSchema?.name || ''
    },
    currentDomain(): string {
      return this.$user.currentDomain
    }
  },
  methods: {
    doEdit(item: any) {
      this.$router.push(`/${this.unit}/forms/${this.formType}/${item.id}`)
    },
    showDelete(item: any) {
      this.deleteDialog.item = item
      this.deleteDialog.value = true
    },
    doDuplicate(item: IBaseObject) {
      if (this.formSchema) {
        this.$api.object
          .create(getSchemaEndpoint(this.formSchema.modelType.toLowerCase()), { ...item })
          .then((response: any) => {
            this.doEdit({ id: response.resourceId })
          })
      }
    },
    doDelete(id: number) {
      this.deleteDialog.value = false
      if (this.formSchema) {
        this.$api.object.delete(getSchemaEndpoint(this.formSchema.modelType.toLowerCase()), id).then(() => {
          this.$fetch()
        })
      }
    },
    changeType() {
      this.$router.push(`/${this.unit}/forms/${this.formType}`)
    }
  }
})
</script>

<style lang="scss" scoped>
.table--description-cell {
  display: block;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table--title-cell {
  font-weight: bold;
  white-space: nowrap;
}

::v-deep table {
  th {
    white-space: nowrap;
  }
}
</style>
