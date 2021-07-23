<template>
  <VeoWidget :title="$t('unitOverview')">
    <div
      v-if="!unit.parent"
      class="mb-3"
    >
      <p style="font-size: 1.1rem; font-weight: bold;">
        {{ $t('unit.details.noparent') }}
      </p>
    </div>
    <!-- VEO-78: Unit Hierarchien deaktiviert, da im Backend nicht implementiert
    <div v-if="unit.parent" class="mb-3">
      <b>{{ $t('unit.details.parent') }}</b>: <nuxt-link :to="`/${unit.parent.resourcesUri}`">{{ unit.parent.displayName }}</nuxt-link>
    </div>
    <b>{{ $t('unit.details.children') }}</b>
    <ul>
      <template v-if="unit.units.length > 0">
        <li v-for="parent of unit.units" :key="parent.id"><nuxt-link :to="`/${parent.id}`">{{ parent.name }}</nuxt-link></li>
      </template>
      <span v-else>{{ $t('unit.details.nochild') }}</span>
    </ul>-->
  </VeoWidget>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    unit: {
      type: Object,
      required: true
    }
  }
});
</script>

<style lang="scss" scoped>
p {
  margin-bottom: 4px !important;
}

.v-card__text {
  font-size: 1rem;
}
</style>

<i18n>
{
  "en": {
    "unitOverview": "Unit overview"
  },
  "de": {
    "unitOverview": "Unit-Übersicht"
  }
}
</i18n>