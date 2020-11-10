<template>
  <v-card>
    <v-card-title :class="unit.parent ? 'pb-1' : 'pb-2'" style="font-size: 1.7rem">{{ unit.name }}</v-card-title>
    <v-card-text>
      <div v-if="!unit.parent" class="mb-3">
        <p style="font-size: 1.1rem; font-weight: bold;">{{ $t('unit.details.noparent') }}</p>
      </div>
      <p>
        <span v-if="unit.description">{{ unit.description }}</span>
        <i v-else>{{ $t('unit.details.nodescription') }}</i>
      </p>
      <br>
      <div v-if="unit.parent" class="mb-3">
        <b>{{ $t('unit.details.parent') }}</b>: <nuxt-link :to="`/${unit.parent.resourcesUri}`">{{ unit.parent.displayName }}</nuxt-link>
      </div>
      <b>{{ $t('unit.details.children') }}</b>
      <ul>
        <template v-if="unit.units.length > 0">
          <li v-for="parent of unit.units" :key="parent.id"><nuxt-link :to="`/${parent.id}`">{{ parent.name }}</nuxt-link></li>
        </template>
        <span v-else>{{ $t('unit.details.nochild') }}</span>
      </ul>
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
