<template>
  <div style="flex-basis: 0;" class="mr-0 text-right flex-grow-1">
    <v-menu
      v-model="value"
      :close-on-content-click="false"
      max-width="350px"
      nudge-bottom="5"
      offset-y
      origin="top right"
    >
      <template #activator="{ on }">
        <v-btn icon dark v-on="on">
          <v-avatar size="48" color="secondary">
            <span class="white--text headline">{{ username.substr(0, 1).toUpperCase() }}</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-avatar color="secondary">
              <v-icon class="white--text headline">{{ username.substr(0, 1).toUpperCase() }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <span>
                {{ prename }}
                {{ lastname }}
              </span>
              <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider />
          <VeoUnitSelection :units="units" />
          <VeoDomainSelection :domains="currentUnitDomains" />
        </v-list>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="$emit('logout')">{{ $t('global.logout') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import VeoDomainSelection from '~/components/layout/VeoDomainSelection.vue'
import VeoUnitSelection from '~/components/layout/VeoUnitSelection.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { IVeoDomain, IVeoUnit } from '~/types/VeoUnits'

export default Vue.extend({
  components: {
    VeoUnitSelection,
    VeoDomainSelection
  },
  props: {
    prename: { type: String, default: '' },
    lastname: { type: String, default: '' },
    username: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  data() {
    return {
      value: false,
      units: [] as IVeoUnit[]
    }
  },
  async fetch() {
    this.units = await this.$api.unit.fetchAll()
  },
  computed: {
    currentUnitDomains(): IVeoDomain[] {
      return this.units.find((unit: IVeoUnit) => unit.id === this.$route.params.unit)?.domains || []
    }
  },
  mounted() {
    this.$root.$on(VeoEvents.UNIT_CHANGED, () => {
      this.$nextTick(() => {
        this.$fetch()
      })
    })
  }
})
</script>

<style lang="stylus" scoped></style>
