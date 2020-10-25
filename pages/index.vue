<template>
  <v-col cols="12">
    <div style="max-width: 640px">
      <div class="body-1 mb-4">{{ $t('page.index.chooseunit') }}:</div>
      <v-data-iterator :search="search" :items="units" item-key="id">
        <template #header>
          <v-text-field v-model="search"
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
            <v-list-item v-for="item in items" :key="item.id" two-line :to="'/'+item.id">
              <v-list-item-content>
                <v-list-item-title v-text="item.name" />
                <v-list-item-subtitle v-text="item.id" />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </template>
      </v-data-iterator>
    </div>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {},
  props: {},
  async fetch() {
    const units = await this.$api.unit.fetchAll()
    this.units = units
  },
  data() {
    return {
      search: '',
      unit: '',
      units: []
    }
  },
  methods: {},
  head() {
    return {
      // title: ''
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
