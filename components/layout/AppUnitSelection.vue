<template>
  <div class="unit-selection-wrapper fill-height d-flex flex-row overflow-hidden align-center">
    <v-select
      v-if="$auth.profile"
      class="unit-select flex-grow-0"
      :items="units"
      item-text="name"
      item-value="id"
      :value="unit"
      hide-details
      flat
      light
      dense
      label="Unit"
      solo
      @change="changeUnit"
    />
    <v-btn x-small fab elevation="0" class="ml-4 primary--text" color="white">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return { units: [] }
  },
  async fetch() {
    if (this.$auth.profile) {
      this.units = await this.$api.unit.fetchAll()
    }
  },
  computed: {
    unit(): string | undefined {
      return this.$route.params.unit || '-'
    }
  },
  methods: {
    changeUnit(e: string) {
      this.$router.push('/' + e)
    }
  }
})
</script>

<style lang="scss" scoped>
.unit-selection-wrapper {
  .unit-select {
      width: 152px; // Workaround bis sich das Select automatisch verkleinern lässt
  }
}
</style>
