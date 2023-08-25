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
  <BasePage
    data-component-name="catalog-page"
  >
    <template #default>
      <LayoutHeadline
        class="mb-4"
        :title="locale === 'de' ? 'Katalog': 'Catalog'"
        :element="title"
      />
      <CatalogDefaultCatalog
        class="mb-4"
        :catalog-items="catalogItems?.items"
        :is-loading="catalogItemsAreFetching"
        :success-text="t('scenariosApplied').toString()"
        :error-text="t('applyScenariosError').toString()"
      >
        <span class="my-2">{{ t('selectScenariosCTA') }}</span>
      </CatalogDefaultCatalog>
    </template>
  </BasePage>
</template>

<script lang="ts">
export default {
  name: 'VeoCatalogPage'
};
export const ROUTE_NAME = 'unit-domains-domain-catalogs-catalog';
</script>

<script setup lang="ts">
import catalogQueryDefinitions from '~/composables/api/queryDefinitions/catalogs';
import { useQuery } from '~~/composables/api/utils/query';

const { t, locale } = useI18n();
const route = useRoute();

const title = computed(() => t('catalog', { name: catalogItems.value?.[0]?.catalog?.displayName || 'DS-GVO' }));

const fetchCatalogItemsQueryParameters = computed(() => (
  {
    domainId: route.params.domain as string,
    elementType: route.query.type === 'all' ? undefined : route.query.type as string,
    size: 100
  }
));

const { data: catalogItems, isFetching: catalogItemsAreFetching } = useQuery(catalogQueryDefinitions.queries.fetchCatalogItems, fetchCatalogItemsQueryParameters);

</script>

<i18n>
{
  "en": {
    "applyEntries": "apply scenarios",
    "applyScenariosError": "Couldn't apply scenarios",
    "applyTOMs": "apply TOMs",
    "applyTOMsError": "Couldn't apply TOMs",
    "catalog": "{name}",
    "scenariosApplied": "Scenarios were applied successfully",
    "selectScenariosCTA": "Please select the scenarios you want to apply.",
    "selectTOMsCTA": "Please choose one or more technical organizational measures to apply.",
    "TOMsApplied": "TOMs were applied"
  },
  "de": {
    "applyEntries": "Gefährdungen anwenden",
    "applyScenariosError": "Gefährdungen konnten nicht angewandt werden",
    "applyTOMs": "TOMs anwenden",
    "applyTOMsError": "Die TOMs konnten nicht angewendet werden",
    "catalog": "{name}",
    "scenariosApplied": "Gefährdungen wurden erfolgreich angewandt",
    "selectScenariosCTA": "Bitte wählen Sie die Gefährdungen aus, die Sie anwenden möchten.",
    "selectTOMsCTA": "Wählen Sie eine oder mehrere technische und organisatorische Maßnahmen aus, die angewendet werden sollen.",
    "TOMsApplied": "TOMs wurden angewendet"
  }
}
</i18n>
