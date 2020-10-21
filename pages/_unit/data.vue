<template>
  <v-container fill-height fluid class="ma-0 pa-0" align-start>
    <v-row class="fill-height" no-gutters>
      <AppSideContainer side="left" :width="350">
        <v-col cols="12" class="pa-0">
          <v-list dense>
            <template v-for="(object, index) in objects">
              <v-list-item v-if="object.groups.length === 0" :key="index" :to="`/${unit}/data/${object.type}/-/`">
                <v-list-item-content>
                  <v-list-item-title v-text="object.name" />
                </v-list-item-content>
              </v-list-item>

              <v-list-group v-else :key="index" v-model="object.active" no-action>
                <template #activator>
                  <v-list-item-content>
                    <v-list-item-title v-text="object.name" />
                  </v-list-item-content>
                </template>

                <v-list-item :to="`/${unit}/data/${object.type}/-/`">
                  <v-list-item-content>
                    <v-list-item-title>Objekte ohne Gruppe</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item v-for="group in object.groups" :key="group.id" :to="`/${unit}/data/${object.type}/${group.id}/`">
                  <v-list-item-content>
                    <v-list-item-title v-text="group.name" />
                  </v-list-item-content>
                </v-list-item>
              </v-list-group>
            </template>
          </v-list>
        </v-col>
      </AppSideContainer>

      <v-col>
        <v-breadcrumbs :items="breadcrumbItems" class="pa-3 text-capitalize" />
        <nuxt-child />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { IBaseObject } from '~/lib/utils'
import AppSideContainer from '~/components/layout/AppSideContainer.vue'
// import { GroupType } from '~/plugins/api/group'

interface IData {
  objects: IBaseObject[]
}

export default Vue.extend({
  components: {
    AppSideContainer
  },
  props: {},
  data(): IData {
    return {
      objects: []
    }
  },
  async fetch() {
    this.objects = [
      {
        type: 'asset',
        name: 'Assets',
        groups: await this.$api.group.fetchAll({ type: 'Asset' })
      },
      {
        type: 'control',
        name: 'Controls',
        groups: await this.$api.group.fetchAll({ type: 'Control' })
      },
      {
        type: 'person',
        name: 'Persons',
        groups: await this.$api.group.fetchAll({ type: 'Person' })
      },
      {
        type: 'process',
        name: 'Processes',
        groups: await this.$api.group.fetchAll({ type: 'Process' })
      }
    ]
  },
  computed: {
    unit(): string {
      return this.$route.params.unit
    },
    breadcrumbItems(): IBaseObject[] {
      const pathArray: string[] = this.$route.path.split('/').filter((el: string) => el !== '')
      return [
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
