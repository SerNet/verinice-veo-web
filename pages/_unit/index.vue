<template>
  <v-row class="pa-4 veo-page">
    <template v-if="$fetchState.pending">
      <v-progress-circular size="64" color="primary" indeterminate />
    </template>
    <template v-else>
      <v-col :cols="12" sm="6" lg="4">
        <VeoUnitWidget :unit="unit" />
      </v-col>
      <v-col :cols="12" sm="6" lg="4">
        <VeoUnitFormsWidget :unit="unit" />
      </v-col>
      <v-col :cols="12" sm="6" lg="4">
        <VeoUnitObjectWidget :unit="unit" />
      </v-col>
    </template>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'

import VeoUnitWidget from '~/components/widgets/VeoUnitWidget.vue'
import VeoUnitFormsWidget from '~/components/widgets/VeoUnitFormsWidget.vue'
import VeoUnitObjectWidget from '~/components/widgets/VeoUnitObjectWidget.vue'

export default Vue.extend({
  components: {
    VeoUnitWidget,
    VeoUnitFormsWidget,
    VeoUnitObjectWidget
  },
  props: {},
  data() {
    return {
      unit: {}
    }
  },
  async fetch() {
    this.unit = await this.$api.unit.fetch(this.$route.params.unit)
  },
  watch: {
    '$route.params': '$fetch'
  },
  methods: {}
})
</script>

<style lang="scss" scoped></style>
