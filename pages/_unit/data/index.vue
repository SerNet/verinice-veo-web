<template>
  <VeoPage title="veo.data">
    <template #title>
      <v-spacer />
      <v-btn
        depressed
        outlined
        :to="`/${$route.params.unit}/data/${currentSchemaType}/${group}/create`"
        color="primary"
        class="align-self-center"
      >
        {{ $t('unit.data.createobject', { type: currentSchemaType }) }}
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
              <v-select
                v-model="currentSchemaType"
                label="Type"
                :items="schemaTypes"
                item-text="schemaName"
                item-value="endpoint"
                outlined
                dense
                @input="changeType()"
              />
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
                @input="changeGroup()"
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
import {
  ComputedRef,
  defineComponent,
  nextTick,
  onMounted,
  Ref,
  ref,
  SetupContext,
  useContext,
  useFetch
} from '@nuxtjs/composition-api'
import { capitalize } from 'lodash'
import { DataTableHeader } from 'vuetify'

import VeoPage from '~/components/layout/VeoPage.vue'
import { ISchemaEndpoint } from '~/plugins/api/schema'

interface IProps {}

export default defineComponent<IProps>({
  components: {
    VeoPage
  },
  setup(props: IProps) {
    const context = useContext()
    // URL parameters
    const currentSchemaType: Ref<string | undefined> = ref(
      context.route.value.params.type
    )
    const group: Ref<string | undefined> = ref(context.route.value.params.group)
    const unit: Ref<string> = ref(context.route.value.params.unit)

    // Common parameters
    const schemaTypes: Ref<ISchemaEndpoint[]> = ref([])

    // Fetch
    const { fetch, fetchState } = useFetch(async () => {
      schemaTypes.value = await context.$api.schema
        .fetchAll()
        .then((data: ISchemaEndpoint[]) => {
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
            objects.value = await context.$api.object.fetchAll(
              currentSchemaType.value as string,
              {
                unit: unit.value
              }
            )
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
          context.app.router?.push(
            `/${unit.value}/data/${schemaTypes.value[0].endpoint}/`
          )
        })
      }
      if (!group.value) {
        context.app.router?.push(
          `/${unit.value}/data/${currentSchemaType.value}/-/`
        )
      }
    }

    // Table related stuff
    const headers: Ref<DataTableHeader[]> = ref([
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
        value: ''
      },
      {
        text: 'Updated at',
        value: ''
      },
      {
        text: '',
        value: 'actions',
        sortable: false
      }
    ])
    const objects: Ref<any[]> = ref([])
    const groups: ComputedRef<{ title: string; id: string }[]> = ref([
      {
        title: '-',
        id: '-'
      }
    ])

    function goToObject(item: any) {
      context.app.router?.push(
        `/${unit.value}/data/${currentSchemaType.value}/${group.value}/${item.id}`
      )
    }

    // Navigation upon changing the schemaType or group
    function changeType() {
      context.app.router?.push(
        `/${unit.value}/data/${currentSchemaType.value}/${group.value}`
      )
    }
    function changeGroup() {
      context.app.router?.push(
        `/${unit.value}/data/${currentSchemaType.value}/${group.value}`
      )
    }

    return {
      group,
      currentSchemaType,
      schemaTypes,
      headers,
      objects,
      groups,
      goToObject,
      changeType,
      changeGroup
    }
  },
  head() {
    return {
      title: 'veo.data'
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
