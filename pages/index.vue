<template>
  <VeoPage :title="$t('breadcrumbs.index')">
    <div class="body-1 mb-4">{{ $t('chooseunit') }}:</div>
    <v-data-iterator :search="search" :items="units" item-key="id">
      <template #header>
        <v-text-field
          v-model="search"
          dense
          clearable
          flat
          solo-inverted
          hide-details
          prepend-inner-icon="mdi-magnify"
          :label="$t('chooseunit_placeholder')"
        />
      </template>
      <template #default="{ items }">
        <v-list dense>
          <v-list-item v-for="item in items" :key="item.id" two-line :to="'/' + createUUIDUrlParam('unit', item.id)">
            <v-list-item-content>
              <v-list-item-title v-text="item.name" />
              <v-list-item-subtitle v-text="item.id" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </template>
    </v-data-iterator>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'

import { createUUIDUrlParam } from '~/lib/utils'
import { IVeoUnit } from '~/types/VeoTypes'

export default Vue.extend({
  props: {},
  data() {
    return {
      search: '',
      unit: '',
      units: [] as IVeoUnit[]
    }
  },
  async fetch() {
    const units = await this.$api.unit.fetchAll()
    this.units = units
  },
  methods: {
    createUUIDUrlParam
  },
  head(): any {
    return {
      title: this.$t('breadcrumbs.index')
    }
  }
})
</script>

<i18n>
{
  "en": {
    "chooseunit": "Please choose a unit",
    "chooseunit_placeholder": "Search for a unit..."
  },
  "de": {
    "chooseunit": "Bitte wählen Sie eine Unit",
    "chooseunit_placeholder": "Nach einer Unit suchen..."
  }
}
</i18n>
