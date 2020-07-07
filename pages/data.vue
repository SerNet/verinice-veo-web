<template>
  <v-container fill-height fluid class="ma-0 pa-0" align-start>
    <v-row no-gutters>
      <AppSideContainer side="left" :width="350">
        <v-col cols="12">
          veo.data Navigation
          <p v-if="$fetchState.pending">Lädt ...</p>
          <ul>
            <li v-for="(object, i) in objects" :key="i">
              <nuxt-link :to="`/data/${object.type}/-/`">{{ object.name }}</nuxt-link>
              <ul v-if="object.groups">
                <li v-for="(group, k) in object.groups" :key="k">
                  <nuxt-link :to="`/data/${object.type}/${group.id}/`">{{ group.name }}</nuxt-link>
                </li>
              </ul>
            </li>
          </ul>
        </v-col>
      </AppSideContainer>

      <v-col class="flex-shrink-0 flex-grow-1">
        <v-breadcrumbs :items="breadcrumbItems" class="text-capitalize" />
        <nuxt-child />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { IBaseObject } from '../lib/utils'
import AppSideContainer from '~/components/layout/AppSideContainer.vue'
// import { GroupType } from '~/plugins/api/group'

export default Vue.extend({
  components: {
    AppSideContainer
  },
  props: {},
  async fetch() {
    // const assetGroups = await this.$api.group.fetchAll('Asset')
    this.objects = [
      {
        type: 'asset',
        name: 'Assets',
        groups: await this.$api.group.fetchAll('Asset')
      },
      {
        type: 'control',
        name: 'Controls',
        groups: await this.$api.group.fetchAll('Control')
      },
      {
        type: 'person',
        name: 'Persons',
        groups: await this.$api.group.fetchAll('Person')
      },
      {
        type: 'process',
        name: 'Processes',
        groups: await this.$api.group.fetchAll('Process')
      }
    ]
  },
  data() {
    return {
      objects: [] as any[]
    }
  },
  computed: {
    breadcrumbItems(): IBaseObject[] {
      const pathArray: string[] = this.$route.path.split('/').filter((el: string) => el !== '')
      return [
        { text: 'dashboard', to: '/', exact: true, disabled: false },
        ...pathArray.map((el: string, i: number) => ({
          text: el,
          to: `/${pathArray.slice(0, i + 1).join('/')}/`,
          exact: true,
          disabled: false
        }))
      ]
    }
  },
  methods: {}
})
</script>

<style lang="scss" scoped></style>
