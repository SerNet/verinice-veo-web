<template>
  <VeoPage title="veo.Objects">
    <template #title>
      <v-spacer />
      <v-btn
        text
        outlined
        :to="`/${unitRoute}/objects/${currentSchemaType}/${group}/create`"
        color="primary"
        class="align-self-center"
      >
        {{ $t('unit.data.createobject', { type: currentSchemaName }) }}
      </v-btn>
    </template>
    <template #default>
      <v-data-table
        :headers="headers"
        :items="objects"
        :items-per-page="20"
        :no-data-text="$t('unit.data.noentries', { types: currentSchemaName })"
        :loading-text="$t('unit.data.loading', { types: currentSchemaName })"
        :loading="$fetchState.pending"
      >
        <template #top>
          <v-row dense>
            <v-col :cols="3">
              <v-select
                v-model="currentSchemaType"
                :label="$t('unit.data.type')"
                :items="schemaTypes"
                item-text="schemaName"
                item-value="endpoint"
                outlined
                dense
                @input="changeType()"
              />
            </v-col>
            <v-col :cols="9">
              <v-text-field :label="$t('unit.data.search')" outlined dense style="visibility: hidden" />
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
      <DeleteObjectDialog v-model="deleteDialog.value" :form="deleteDialog.item" @delete="doDelete" />
    </template>
  </VeoPage>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, Ref, ref, useContext, useFetch } from '@nuxtjs/composition-api'
import { capitalize } from 'lodash'
import { DataTableHeader } from 'vuetify'

import VeoPage from '~/components/layout/VeoPage.vue'
import { createUUIDUrlParam, IBaseObject, separateUUIDParam } from '~/lib/utils'
import { getSchemaName, ISchemaEndpoint } from '~/plugins/api/schema'
import DeleteObjectDialog from '~/components/dialogs/DeleteObjectDialog.vue'

interface IProps {}

export default defineComponent<IProps>({
  components: {
    VeoPage,
    DeleteObjectDialog
  },
  setup(props: IProps) {
    const context = useContext()
    // URL parameters
    const currentSchemaType: Ref<string> = ref(context.route.value.params.type)
    const currentSchemaName = computed(() => getSchemaName(currentSchemaType.value || ''))
    const group: Ref<string | undefined> = ref(context.route.value.params.group)
    const unitId = computed(() => separateUUIDParam(context.route.value.params.unit).id)
    const unitRoute = computed(() => context.route.value.params.unit)

    // Common parameters
    const schemaTypes: Ref<ISchemaEndpoint[]> = ref([])

    // Fetch
    const { fetch, fetchState } = useFetch(async () => {
      schemaTypes.value = await context.$api.schema.fetchAll().then((data: ISchemaEndpoint[]) => {
        return data.map(entry => {
          return {
            schemaName: capitalize(entry.schemaName),
            endpoint: entry.endpoint
          }
        })
      })
      if (currentSchemaType.value) {
        // We have to do everything on next tick, else the correct schema type won't get picked up.
        await nextTick(async () => {
          if (!group.value || group.value === '-') {
            // @ts-ignore
            objects.value = await context.$api.object.fetchAll(currentSchemaType.value as string, {
              unit: unitId.value
            })
          } else {
            objects.value = await context.$api.group.fetchGroupMembers(
              group.value as string,
              currentSchemaType.value as string
            )
          }
        })
      }
    })

    // Make sure the url always displays all parameters
    onMounted(verifyURLParameters)

    async function verifyURLParameters() {
      if (!currentSchemaType.value) {
        if (schemaTypes.value.length === 0) {
          await fetch()
        }
        nextTick(() => {
          context.app.router?.push(`/${unitRoute.value}/objects/${schemaTypes.value[0].endpoint}/`)
        })
      }
      if (!group.value) {
        context.app.router?.push(`/${unitRoute.value}/objects/${currentSchemaType.value}/-/`)
      }
    }

    // Table related stuff
    const headers: Ref<DataTableHeader[]> = ref([
      {
        text: context.app.i18n.t('unit.forms.header.abbreviation') as string,
        value: 'abbreviation'
      },
      {
        text: context.app.i18n.t('unit.forms.header.title') as string,
        value: 'name'
      },
      {
        text: context.app.i18n.t('unit.forms.header.description') as string,
        value: 'description',
        sortable: false
      },
      {
        text: context.app.i18n.t('unit.forms.header.updatedby') as string,
        value: 'updatedBy'
      },
      {
        text: context.app.i18n.t('unit.forms.header.updatedat') as string,
        value: 'updatedAt'
      },
      {
        text: '',
        value: 'actions',
        sortable: false
      }
    ])
    const objects: Ref<any[]> = ref([])

    // Navigation upon changing the schemaType or group
    function changeType() {
      context.app.router?.push({
        params: {
          ...context.route.value.params,
          type: currentSchemaType.value || ''
        }
      })
    }
    function changeGroup() {
      context.app.router?.push({
        params: {
          ...context.route.value.params,
          group: group.value || ''
        }
      })
    }

    // CRUD actions
    const deleteDialog: Ref<{ value: boolean; item: any }> = ref({ value: false, item: undefined })

    function doEdit(item: any) {
      context.app.router?.push(
        `/${unitRoute.value}/objects/${currentSchemaType.value}/${group.value}/${createUUIDUrlParam(
          currentSchemaName.value as string,
          item.id
        )}`
      )
    }

    function showDelete(item: any) {
      deleteDialog.value.item = item
      deleteDialog.value.value = true
    }

    function doDuplicate(item: IBaseObject) {
      context.$api.object.create(currentSchemaType.value, { ...item }).then((response: any) => {
        doEdit({ id: response.resourceId })
      })
    }

    function doDelete(id: string) {
      deleteDialog.value.value = false
      context.$api.object.delete(currentSchemaType.value, id).then(() => {
        fetch()
      })
    }

    return {
      unitRoute,
      group,
      currentSchemaType,
      currentSchemaName,
      schemaTypes,
      headers,
      objects,
      changeType,
      changeGroup,
      doEdit,
      doDuplicate,
      showDelete,
      doDelete,
      deleteDialog,
      separateUUIDParam
    }
  },
  head() {
    return {
      title: 'veo.Objects'
    }
  }
})
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

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
