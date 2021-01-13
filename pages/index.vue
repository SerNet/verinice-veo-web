<template>
  <VeoPage :title="$t('page.index.title')">
    <div class="body-1 mb-4">{{ $t('page.index.chooseunit') }}:</div>
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
          :label="$t('page.index.chooseunitplaceholder')"
        />
      </template>
      <template #default="{ items }">
        <v-list dense>
          <v-list-item
            v-for="item in items"
            :key="item.id"
            two-line
            :to="'/' + item.id"
          >
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

import VeoPage from '~/components/layout/VeoPage.vue'

export default Vue.extend({
  components: {
    VeoPage
  },
  props: {},
  data() {
    return {
      search: '',
      unit: '',
      units: []
    }
  },
  async fetch() {
    const units = await this.$api.unit.fetchAll()
    this.units = units
  },
  head(): any {
    return {
      title: this.$t('page.index.title')
    }
  }
})
</script>

<style lang="scss" scoped></style>
