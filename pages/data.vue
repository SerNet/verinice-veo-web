<template>
  <v-container fill-height fluid class="ma-0 pa-0" align-start>
    <v-row no-gutters>
      <AppSideContainer side="left" :width="350">
        <v-col cols="12" class="pa-0">
          <v-list dense>
            <template v-for="(object, index) in objects">
              <v-list-item v-if="object.groups.length === 0" :key="index" :to="`/data/${object.type}/-/`">
                <v-list-item-content>
                  <v-list-item-title v-text="object.name" />
                </v-list-item-content>
              </v-list-item>

              <v-list-group v-else :key="index" v-model="object.active" no-action>
                <template v-slot:activator>
                  <v-list-item-content>
                    <v-list-item-title v-text="object.name" />
                  </v-list-item-content>
                </template>

                <v-list-item v-for="group in object.groups" :key="group.id" :to="`/data/${object.type}/${group.id}/`">
                  <v-list-item-content>
                    <v-list-item-title v-text="group.name" />
                  </v-list-item-content>
                </v-list-item>
              </v-list-group>
            </template>
          </v-list>
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
