<script>
</script>
<template>
  <VeoPage title="veo.data">
    <v-data-table
      :headers="headers"
      :items="objects"
      :items-per-page="20"
      :no-data-text="`Keine {types} vorhanden!`"
      :loading-text="`{types} werden geladen...`"
    >
      <template #top>
        <v-row dense>
          <v-col :cols="3">
            <v-select v-model="objectType" label="Type" :items="objectTypes" outlined dense />
          </v-col>
          <v-col :cols="3">
            <v-select v-model="group" label="Group" outlined dense />
          </v-col>
          <v-col :cols="6">
            <v-text-field label="Title" outlined dense />
          </v-col>
        </v-row>
      </template>
      <template #item.name="{ value, item }">
        <nuxt-link :to="`/${$route.params.unit}/data/${objectType}/${group}/${item.id}`">
          {{ value }}
        </nuxt-link>
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
  </VeoPage>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

import VeoPage from '~/components/layout/VeoPage.vue'
import { ObjectSchemaNames } from '~/types/FormSchema'
import { GroupType } from '~/plugins/api/group'
import { Route } from 'vue-router'

interface IProps {
  title?: string,
  fullsize: boolean,
  cols: number,
  md: number,
  xl: number,
  fixedWidth: boolean,
  noPadding: boolean
}

export default defineComponent<IProps>({
  components: {
    VeoPage
  },
  data() {
    return {
      group: '-' as string,
      objectType: 'asset' /* ObjectSchemaNames[0] */ as string,
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
      ],
      objects: [] as any
    }
  },
  computed: {
    objectTypes(): {text: string, value: string}[] {
      const keys = Object.keys(ObjectSchemaNames)

      return keys.map((key: string) => {
        return {
          text: this.$t(`unit.data.type.${key}`) as string,
          value: key
        }
      })
    }
  },
  async fetch() {
    this.objects = []

    // @ts-ignore
    this.objects = await this.$api[this.objectType].fetchAll({ unit: this.$route.params.unit })
    console.log(this.objects)
    /*
    if (this.$route.params.group === '-') {
      this.objects = await this.$api[this.objectType].fetchAll({ unit: this.$route.params.unit })
    } else {
      let groupType = this.$route.params.type as GroupType
      groupType = (groupType.charAt(0).toUpperCase() + groupType.slice(1)) as GroupType
      this.objects = await this.$api.group.fetchGroupMembers(this.$route.params.group, groupType)
    }
    */
  },
  mounted() {
    if(this.$route.params.type) {
      this.objectType = this.$route.params.type
    }
    if(this.$route.params.group) {
      this.group = this.$route.params.group
    }
  },
  watch: {
    '$route'(newValue: Route) {
      console.log(newValue)
    }
  }
})
</script>
<style lang="scss" scoped>

</style>
