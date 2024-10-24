<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, jae
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
  <BasePage data-component-name="catalog-page">
    <template #default>
      <v-spacer class="mt-8" />
      <SearchBar v-model:search="search" :filters="searchFilters" />
      <CatalogDefaultCatalog
        v-model="selectedItems"
        v-model:page="page"
        v-model:sortBy="sortBy"
        class="mt-2 mb-4"
        :catalog-items="searchResults ?? catalogItems"
        :is-loading="catalogItemsAreFetching || isLoadingSearchResults"
        :is-applying-items="isApplyingItems"
        @apply-items="applyItems"
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
export const ROUTE_NAME = 'unit-domains-domain-catalog';
</script>

<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router';
import catalogQueryDefinitions, { CustomAspect } from '~/composables/api/queryDefinitions/catalogs';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery, useQuerySync } from '~/composables/api/utils/query';

// Types
import type { VeoSearch } from '~/types/VeoSearch';
import type { IVeoEntity } from '~/types/VeoTypes';

// Composables
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { t } = useI18n();
const route = useRoute();
const { clearCustomBreadcrumbs, addCustomBreadcrumb } = useVeoBreadcrumbs();

// State
const currentDomainId = computed(() => route.params.domain as string);
const currentSubType = computed(() => (route.query.subType === 'all' ? undefined : (route.query.subType as string)));

// Always show query params in url
// This ensures an active state in the navbar (e.g. after a reload)
if (!currentSubType.value) {
  navigateTo({
    name: 'unit-domains-domain-catalog',
    query: {
      type: 'all',
      subType: 'all'
    }
  });
}

const { tablePageSize } = useVeoUser();
const page = ref<number>(0);
const sortBy = ref([{ key: 'abbreviation', order: 'asc' }]);

// Fetch catalog items
const fetchCatalogItemsQueryParameters = computed(() => ({
  domainId: currentDomainId?.value,
  subType: currentSubType?.value,
  size: tablePageSize.value,
  page: page.value,
  sortBy: sortBy.value[0]?.key,
  sortOrder: sortBy.value[0]?.order,
  customAspects: [CustomAspect.ControlBpInformation]
}));

const { data: catalogItems, isFetching: catalogItemsAreFetching } = useQuery(
  catalogQueryDefinitions.queries.fetchCatalogItems,
  fetchCatalogItemsQueryParameters,
  { keepPreviousData: true }
);

const { subTypeTranslation: currentSubTypeTranslated } = useSubTypeTranslation();

// SEARCH
const searchFilters = { all: ['abbreviation', 'name'], default: 'name' };

// v-model from `SearchBar`
const search = ref<VeoSearch[]>([]);

// get search results
const { data: searchResults, isLoading: isLoadingSearchResults } = useSearch({
  baseQueryParameters: fetchCatalogItemsQueryParameters,
  queryDefinition: catalogQueryDefinitions.queries.fetchCatalogItems,
  search
});

/* BREADCRUMBS */
// Add breadcrumb for current filter
const customBreadcrumbArgs = computed(() => ({
  to: `/${route.params.unit}/domains/${route.params.domain}/catalog?type=${route.query.type}&subType=${route.query.subType}`,
  exact: true,
  key: 'catalog',
  index: 1,
  text: currentSubTypeTranslated.value || t('all'),
  param: '',
  disabled: true
}));

onMounted(() => addCustomBreadcrumb(customBreadcrumbArgs.value));

// Update breadcrumb if a filter is changed
watch(
  () => route.fullPath,
  () => {
    clearCustomBreadcrumbs();
    addCustomBreadcrumb(customBreadcrumbArgs.value);
  }
);

// Remove breadcrumb on leaving route: otherwise they persist in other views
onBeforeRouteLeave(async (_to, _from) => {
  clearCustomBreadcrumbs();
});

// Incarnate, create objects, from selected catalog items
const { mutateAsync: incarnate } = useMutation(unitQueryDefinitions.mutations.updateIncarnations);
const selectedItems = ref<IVeoEntity[]>([]);
const isApplyingItems = ref(false);

async function applyItems() {
  isApplyingItems.value = true;
  try {
    // Fetch incarnations for all selected items
    const fetchParameters = {
      unitId: route.params.unit as string,
      domainId: route.params.domain as string,
      itemIds: selectedItems.value.map((item) => item.id)
    };

    const incarnations = await useQuerySync(unitQueryDefinitions.queries.fetchIncarnationDescriptions, fetchParameters);

    // API sends back an array of catalog elements, which can be incarnated in the following
    // If this array is empty, there is nothing to incarnate and we return from the function
    if (!incarnations.parameters.length) {
      displaySuccessMessage(t('itemsAlreadyApplied'));
      return;
    }

    // Apply incarnations
    await incarnate({ incarnations, unitId: route.params.unit });
    displaySuccessMessage(t('itemsApplied'));
    selectedItems.value = [];
  } catch (e: any) {
    displayErrorMessage(t('applyItemsError'), e.message);
  } finally {
    isApplyingItems.value = false;
  }
}
</script>

<i18n>
{
  "en": {
    "all": "All",
    "applyEntries": "apply scenarios",
    "applyScenariosError": "Couldn't apply scenarios",
    "applyTOMs": "apply TOMs",
    "applyTOMsError": "Couldn't apply TOMs",
    "catalog": "{name}",
    "scenariosApplied": "Scenarios were applied successfully",
    "selectScenariosCTA": "Please select the scenarios you want to apply.",
    "selectTOMsCTA": "Please choose one or more technical organizational measures to apply.",
    "TOMsApplied": "TOMs were applied",
    "itemsApplied": "Successfully applied catalog elements.",
    "applyItemsError": "Could not apply catalog elements.",
    "itemsAlreadyApplied": "Catalog elements have already been applied. No new elements have been created."
  },
  "de": {
    "all": "Alle",
    "applyEntries": "Gefährdungen anwenden",
    "applyScenariosError": "Gefährdungen konnten nicht angewandt werden",
    "applyTOMs": "TOMs anwenden",
    "applyTOMsError": "Die TOMs konnten nicht angewendet werden",
    "catalog": "{name}",
    "scenariosApplied": "Gefährdungen wurden erfolgreich angewandt",
    "selectScenariosCTA": "Bitte wählen Sie die Gefährdungen aus, die Sie anwenden möchten.",
    "selectTOMsCTA": "Wählen Sie eine oder mehrere technische und organisatorische Maßnahmen aus, die angewendet werden sollen.",
    "TOMsApplied": "TOM wurden angewendet",
    "itemsApplied": "Katalogelemente wurden erfolgreich angewendet.",
    "applyItemsError": "Katalogelemente konnten nicht angewandt werden.",
    "itemsAlreadyApplied": "Katalogelemente wurden bereits angewandt. Es wurden keinen neuen Elemente erzeugt."
  }
}
</i18n>
