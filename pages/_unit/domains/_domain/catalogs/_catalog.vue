<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
  <VeoPage :title="title">
    <template #default>
      <VeoTabs class="mt-6">
        <template #tabs>
          <v-tab>{{ t('applyEntries') }}</v-tab>
          <v-tab v-if="catalogContainsTOMs">
            {{ t('applyTOMs') }}
          </v-tab>
        </template>
        <template #items>
          <v-tab-item>
            <VeoDefaultCatalog
              :catalog-items="catalogItems"
              :loading="$fetchState.pending"
            />
          </v-tab-item>
          <v-tab-item>
            <VeoTOMCatalog
              :catalog-items="catalogItems"
              :loading="$fetchState.pending"
            />
          </v-tab-item>
        </template>
      </VeoTabs>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch, useRoute, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoCatalogItem } from '~/types/VeoTypes';

export const ROUTE_NAME = 'unit-domains-domain-catalogs-catalog';

export default defineComponent({
  name: 'VeoCatalogPage',
  setup() {
    const { $api } = useContext();
    const { t } = useI18n();
    const route = useRoute();

    const title = computed(() => t('catalog', { name: catalogItems.value?.[0]?.catalog?.displayName || '' }));

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);
    const catalogId = computed(() => separateUUIDParam(route.value.params.catalog).id);

    const catalogItems = ref<IVeoCatalogItem[]>([]);

    const catalogContainsTOMs = computed(() => catalogItems.value.some((item) => item.tailoringReferences.length > 0));

    const { fetch } = useFetch(async () => {
      catalogItems.value = await $api.catalog.fetchItems(catalogId.value, domainId.value);
    });

    watch(
      () => domainId.value,
      () => fetch()
    );
    watch(
      () => catalogId.value,
      () => fetch()
    );

    return {
      catalogContainsTOMs,
      catalogItems,
      title,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "applyEntries": "apply scenarios",
    "applyTOMs": "apply TOMs",
    "catalog": "Catalog {name}"
  },
  "de": {
    "applyEntries": "Gefährdungen anwenden",
    "applyTOMs": "TOMs anwenden",
    "catalog": "Katalog {name}"
  }
}
</i18n>
