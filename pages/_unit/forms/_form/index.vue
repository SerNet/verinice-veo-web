<template>
  <VeoPage :title="$t('breadcrumbs.forms')">
    <template #title>
      <v-spacer />
      <v-btn
        depressed
        text
        outlined
        :to="`/${unitRoute}/forms/${formRoute}/create`"
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
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn icon @click="doEdit(item)" v-on="on">
                <v-icon>
                  mdi-pencil
                </v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('unit.forms.tooltip.edit') }}
            </template>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn icon @click="doDuplicate(item)" v-on="on">
                <v-icon>
                  mdi-content-copy
                </v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('unit.forms.tooltip.clone') }}
            </template>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn icon @click="showDelete(item)" v-on="on">
                <v-icon>
                  mdi-delete
                </v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('unit.forms.tooltip.delete') }}
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
      <DeleteFormDialog v-model="deleteDialog.value" :form="deleteDialog.item" @delete="doDelete" />
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'

import VeoPage from '~/components/layout/VeoPage.vue'
import { createUUIDUrlParam, IBaseObject, separateUUIDParam } from '~/lib/utils'
import { endpoints, getSchemaEndpoint } from '~/plugins/api/schema'
import DeleteFormDialog from '~/components/dialogs/DeleteFormDialog.vue'
import { IVeoFormSchema, IVeoFormSchemaMeta } from '~/types/VeoTypes'

interface IData {
  formSchema: IVeoFormSchema | undefined
  objectType: string | undefined
  objectTypePlural: string | undefined
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
      objectTypePlural: '',
      objects: [],
      formType: separateUUIDParam(this.$route.params.form).id,
      formTypes: [],
      headers: [
        {
          text: this.$t('unit.list.header.abbreviation'),
          value: 'abbreviation'
        },
        {
          text: this.$t('unit.list.header.title'),
          value: 'name'
        },
        {
          text: this.$t('unit.list.header.description'),
          value: 'description',
          sortable: false
        },
        {
          text: this.$t('unit.list.header.updatedby'),
          value: 'updatedBy'
        },
        {
          text: this.$t('unit.list.header.updatedat'),
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
    this.formSchema = await this.$api.form.fetch(this.formId)
    this.objectType = this.formSchema && this.formSchema.modelType.toLowerCase()
    if (this.formSchema) {
      // @ts-ignore
      this.objectTypePlural = endpoints[this.formSchema.modelType.toLowerCase()]

      this.objects = await this.$api.entity.fetchAll(this.objectTypePlural, {
        unit: this.unitId
      })
    } else {
      this.objects = []
    }

    this.formTypes = await this.$api.form.fetchAll({ unit: this.unitId }).then((formTypes: IVeoFormSchemaMeta[]) =>
      formTypes.map((entry: IVeoFormSchemaMeta) => {
        return {
          text: entry.name,
          value: entry.id
        }
      })
    )
  },
  head() {
    return {
      title: this.$t('breadcrumbs.forms') as string
    }
  },
  computed: {
    unitId() {
      return separateUUIDParam(this.$route.params.unit).id
    },
    unitRoute() {
      return this.$route.params.unit
    },
    formId() {
      return separateUUIDParam(this.$route.params.form).id
    },
    formRoute(): string {
      return createUUIDUrlParam('form', this.formType)
    },
    /**
     * Only display objects that either have no subtype set (but still are part of the model type)
     * OR have a subtype that is the same as the subType of the form schema
     */
    displayedObjects(): IBaseObject[] {
      return this.objects.filter(
        (object: IBaseObject) =>
          !this.formSchema ||
          !object.subType[this.$user.currentDomain] ||
          object.subType[this.$user.currentDomain] === this.formSchema.subType
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
      this.$router.push(
        `/${this.unitRoute}/forms/${this.formRoute}/${createUUIDUrlParam(this.objectType as string, item.id)}`
      )
    },
    showDelete(item: any) {
      this.deleteDialog.item = item
      this.deleteDialog.value = true
    },
    doDuplicate(item: IBaseObject) {
      if (this.formSchema) {
        this.$api.entity
          .create(getSchemaEndpoint(this.formSchema.modelType.toLowerCase()), { ...item })
          .then((response: any) => {
            this.doEdit({ id: response.resourceId })
          })
      }
    },
    doDelete(id: number) {
      this.deleteDialog.value = false
      if (this.formSchema) {
        this.$api.entity.delete(getSchemaEndpoint(this.formSchema.modelType.toLowerCase()), id).then(() => {
          this.$fetch()
        })
      }
    },
    changeType() {
      this.$router.push(`/${this.unitRoute}/forms/${this.formRoute}`)
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
