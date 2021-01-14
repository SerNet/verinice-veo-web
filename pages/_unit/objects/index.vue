<template>
  <VeoPage title="veo.Objects">
    <template #title>
      <v-spacer />
      <v-btn
        text
        outlined
        :to="`/${$route.params.unit}/objects/${objectType}/${group}/create`"
        color="primary"
        class="align-self-center"
      >
        {{ $t('unit.data.createobject', { type: objectType }) }}
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
              <v-select v-model="objectType" label="Type" :items="objectTypes" outlined dense @input="changeType()" />
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
import { defineComponent } from '@nuxtjs/composition-api'

import VeoPage from '~/components/layout/VeoPage.vue'
import { ObjectSchemaNames } from '~/types/FormSchema'
import { GroupType } from '~/plugins/api/group'

interface IProps {}

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
  async fetch() {
    this.objects = []

    // We have to do everythin on next tick, else the correct objecttype won't get picked up.
    await this.$nextTick(async () => {
      if (!this.$route.params.group || this.$route.params.group === '-') {
        // @ts-ignore
        this.objects = await this.$api[this.objectType].fetchAll({
          unit: this.$route.params.unit
        })
      } else {
        this.objects = await this.$api.group.fetchGroupMembers(this.$route.params.group, this.objectType as GroupType)
      }
    })
  },
  head() {
    return {
      title: 'veo.Objects'
    }
  },
  computed: {
    objectTypes(): { text: string; value: string }[] {
      const keys = Object.keys(ObjectSchemaNames)

      return keys.map((key: string) => {
        return {
          // Vetur complains about this line, so we disable verification of it.
          // @ts-ignore
          text: this.capitalize(key),
          value: key
        }
      })
    },
    groups(): { title: '-'; id: '-' }[] {
      return [
        {
          title: '-',
          id: '-'
        }
      ]
    }
  },
  mounted() {
    if (this.$route.params.type) {
      this.objectType = this.$route.params.type
    }
    if (this.$route.params.group) {
      this.group = this.$route.params.group
    }
  },
  methods: {
    changeType() {
      this.$router.push(`/${this.$route.params.unit}/objects/${this.objectType}/${this.group}`)
    },
    changeGroup() {
      this.$router.push(`/${this.$route.params.unit}/objects/${this.objectType}/${this.group}`)
    },
    goToObject(item: any) {
      this.$router.push(`/${this.$route.params.unit}/objects/${this.objectType}/${this.group}/${item.id}`)
    },
    capitalize(string: string): string {
      return string.charAt(0).toUpperCase() + string.slice(1)
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
