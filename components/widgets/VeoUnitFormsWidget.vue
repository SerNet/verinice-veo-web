<template>
  <v-card>
    <v-card-title>{{ $t('unit.details.forms') }}</v-card-title>
    <v-card-text>Text</v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    unit: {
      type: Object,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped></style>
