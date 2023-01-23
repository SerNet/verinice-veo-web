<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <BaseCard>
    <v-list>
      <v-list-item v-if="loading">
        <v-skeleton-loader
          type="text"
          class="mb-0 flex-grow-0"
          width="100"
        />
        <v-skeleton-loader
          type="text"
          class="flex-grow-0"
          width="100"
        />
      </v-list-item>
      <template v-else>
        <v-list-item
          v-for="catalog of catalogs"
          :key="catalog.id"
          :to="generateRoute(catalog.id)"
        >
          <v-list-item-title class="d-flex justify-space-between">
            <span class="flex-grow-0 mb-0 font-weight-bold">{{ catalog.name }}</span>
            <span class="flex-grow-0">{{ t('applicableItems') }}: {{ catalog.catalogItems.length }}</span>
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </BaseCard>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

import { createUUIDUrlParam } from '~/lib/utils';
import { IVeoCatalog } from '~/types/VeoTypes';

defineProps({
  catalogs: {
    type: Array as PropType<IVeoCatalog[]>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});
 
const route = useRoute();
const { t } = useI18n();

const generateRoute = (catalogId: string) => `/${route.params.unit}/domains/${route.params.domain}/catalogs/${createUUIDUrlParam('catalog', catalogId)}`;
</script>

<i18n>
{
  "en": {
    "applicableItems": "applicable items"
  },
  "de": {
    "applicableItems": "anwendbare Einträge"
  }
}
</i18n>

<style lang="scss" scoped>
span,
.v-skeleton-loader {
  flex-basis: auto;
}
</style>
