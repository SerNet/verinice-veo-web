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
  <v-list>
    <v-list-item v-if="loading">
      <v-list-item-content class="justify-space-between">
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
      </v-list-item-content>
    </v-list-item>
    <template v-else>
      <v-list-item
        v-for="catalog of catalogs"
        :key="catalog.id"
        :to="generateRoute(catalog.id)"
      >
        <v-list-item-content class="justify-space-between">
          <span class="flex-grow-0 mb-0 font-weight-bold">{{ catalog.name }}</span>
          <span class="flex-grow-0">{{ t('applicableItems') }}: {{ catalog.catalogItems.length }}</span>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-list>
</template>

<script lang="ts">
import { defineComponent, PropType, useRoute } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { createUUIDUrlParam } from '~/lib/utils';
import { IVeoCatalog } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    catalogs: {
      type: Array as PropType<IVeoCatalog[]>,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const route = useRoute();
    const { t } = useI18n();

    const generateRoute = (catalogId: string) => `/${route.value.params.unit}/domains/${route.value.params.domain}/catalogs/${createUUIDUrlParam('catalog', catalogId)}`;

    return {
      generateRoute,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "applicableItems": "applicable items"
  },
  "en": {
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
