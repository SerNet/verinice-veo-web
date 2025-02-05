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
        v-model:sort-by="sortBy"
        class="mt-2 mb-4"
        :catalog-items="catalogItems"
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
import { useTableSort } from '~/composables/tableSort/useTableSort';

// Types
import type { VeoSearch } from '~/types/VeoSearch';
import type { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

// Composables
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { t } = useI18n();
const route = useRoute();
const { clearCustomBreadcrumbs, addCustomBreadcrumb } = useVeoBreadcrumbs();
const { sortBy } = useTableSort({ key: 'abbreviation', order: 'asc' });
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

// Fetch catalog items
const fetchCatalogItemsQueryParameters = computed(() => ({
  domainId: currentDomainId?.value,
  subType: currentSubType?.value,
  size: tablePageSize.value,
  page: page.value,
  sortBy: sortBy.value?.key,
  sortOrder: sortBy.value?.order,
  customAspects: [CustomAspect.ControlBpInformation]
}));

const { data: _catalogItems, isFetching: catalogItemsAreFetching } = useQuery(
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

const catalogItems = computed<IVeoPaginatedResponse<IVeoEntity[]>>(() => {
  return search.value?.length && searchResults.value ? searchResults.value : _catalogItems.value;
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

<i18n src="~/locales/base/pages/unit-domains-domain-catalog-index.json"></i18n>
