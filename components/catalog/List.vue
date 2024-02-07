<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann, jae
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
        <v-skeleton-loader type="text" class="mb-0 flex-grow-0" width="100" />
        <v-skeleton-loader type="text" class="flex-grow-0" width="100" />
      </v-list-item>
      <template v-else>
        <v-list-item v-for="catalog in currentCatalogs" :key="catalog.id" :to="generateRoute(catalog.id)">
          <v-list-item-title class="d-flex justify-space-between">
            <span class="flex-grow-0 mb-0 font-weight-bold">{{ catalog.name }}</span>
            <span class="flex-grow-0">{{ t('applicableItems') }}: {{ catalog.catalogItems.length }}</span>
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </BaseCard>
</template>

<script setup lang="ts">
import { IVeoCatalog } from '~/composables/api/queryDefinitions/catalogs';

interface Props {
  catalogs: IVeoCatalog[];
  loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  catalogs: () => [],
  loading: false
});

const route = useRoute();
const { t } = useI18n();

const currentDomainId = route.params.domain;
const currentCatalogs = computed(() => props.catalogs.filter((catalog) => catalog.id === currentDomainId) || []);

const generateRoute = (catalogId: string) =>
  `/${route.params.unit}/domains/${route.params.domain}/catalogs/${catalogId}`;
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
