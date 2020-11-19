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
                    <v-list-item-title>{{ $t('unit.data.nogroup') }}</v-list-item-title>
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
import { TranslateResult } from 'vue-i18n/types/index'
import { IBaseObject } from '~/lib/utils'
import AppSideContainer from '~/components/layout/AppSideContainer.vue'
import { ObjectSchemaNames } from '~/types/FormSchema'

export default Vue.extend({
  components: {
    AppSideContainer
  },
  props: {},
  data() {
    return {
      objects: [] as { type: string, name: TranslateResult, groups: any, active: any }[]
    }
  },
  async fetch() {
    const keys = Object.keys(ObjectSchemaNames)
    for await (const key of keys) {
      this.objects.push({
        type: key,
        name: this.$t(`unit.data.type.${key}`),
        groups: await this.$api.group.fetchAll({ type: this.capitalize(key), unit: this.$route.params.unit }),
        active: undefined
      })
    }
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
  methods: {
    capitalize(string: string): string {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }
  }
})
</script>

<style lang="scss" scoped></style>
