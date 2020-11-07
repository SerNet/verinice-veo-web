<template>
  <v-card>
    <v-card-title>{{ unit.name }}</v-card-title>
    <v-card-text>
      <p>{{ $t('unit.details.parents') }}:</p>
      <ul v-if="unit.units.length > 0">
        <li v-for="parent of units" :key="parent.id"><nuxt-link :to="`/${parent.id}`">{{ parent.name }}</nuxt-link></li>
      </ul>
      <p v-else class="ml-2">{{ $t('unit.details.noparent') }}</p>
    </v-card-text>
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

<style lang="scss" scoped>
p {
    margin-bottom: 4px !important;
}

.v-card__text {
    font-size: 1rem;
}
</style>
