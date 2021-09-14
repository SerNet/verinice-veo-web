<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
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