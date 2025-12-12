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
  <BasePage data-component-name="catalog-page" :title="t('breadcrumbs.catalog')">
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
        :is-applying-items="isPending"
        @apply-items="maybeCreateObjects()"
      >
        <span class="my-2">{{ t('selectScenariosCTA') }}</span>
      </CatalogDefaultCatalog>
      <BaseDialog
        :model-value="showDialog"
        :title="t('CatalogItemsApplied')"
        data-veo-test="catalog-dialog"
        :aria-label="t('CatalogItemsApplied')"
        :close-function="() => (showDialog = false)"
      >
        <template #default>
          <BaseCard>
            <v-list role="menu" :aria-label="t('CatalogItemsApplied')">
              <v-list-item
                v-for="(subtypeGroup, index) in createdObjectsBySubtype"
                :key="index"
                role="menuitem"
                class="catalog-items-applied text-primary text-decoration-underline"
                tabindex="0"
                :to="generateRoute({ item: subtypeGroup })"
              >
                {{ subtypeGroup.name }} ({{ subtypeGroup.items.length }})
              </v-list-item>
            </v-list>
          </BaseCard>
          <v-row class="my-2">
            <v-col cols="auto">
              <v-btn variant="text" @click="showDialog = false">{{ t('global.button.cancel') }}</v-btn>
            </v-col>
          </v-row>
        </template>
      </BaseDialog>
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
import { useQuery } from '~/composables/api/utils/query';
import { useSubTypeTranslation } from '~/composables/Translations';
import type { VeoSearch } from '~/types/VeoSearch';
import { VeoElementTypePlurals, type IVeoLink, type IVeoEntity, type IVeoPaginatedResponse } from '~/types/VeoTypes';

const { t, locale } = useI18n();
const route = useRoute();
const { clearCustomBreadcrumbs, addCustomBreadcrumb } = useVeoBreadcrumbs();

const currentDomainId = computed(() => route.params.domain as string);
const currentSubType = computed(() => (route.query.subType === 'all' ? undefined : (route.query.subType as string)));
const { data: currentDomain } = useCurrentDomain();

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
const showDialog = ref(false);
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
const generateRoute = ({ item }: { item: any }) =>
  `/${route.params.unit}/domains/${route.params.domain}/${VeoElementTypePlurals[item.items[0].type as keyof typeof VeoElementTypePlurals]}/${item.items[0].subType}`;

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

// Create objects from selected catalog items
const unitId = computed(() => route.params.unit as string);
const itemIds = computed(() => selectedItems.value.map((item) => item.id));
const selectedItems = ref<IVeoEntity[]>([]);
const createdObjectsBySubtype = ref<Array<{ name: string; items: IVeoLink[] }>>([]);

const {
  mutate: maybeCreateObjects,
  data: incarnatedObjects,
  isPending,
  isSuccess,
  isError
} = useCatalogItems(unitId, currentDomainId, itemIds);

const messages = computed(() => ({
  loading: t('applyingItems'),
  success: incarnatedObjects.value?.length ? t('itemsApplied') : t('itemsAlreadyApplied'),
  error: { title: t('applyItemsError') }
}));

// Open dialog with references if new objects were created
watch(incarnatedObjects, (newVal) => {
  if (newVal?.length) {
    createdObjectsBySubtype.value = groupNewObjects(newVal);
    showDialog.value = true;
    selectedItems.value = [];
  }
});

useUserFeedback({ isLoading: isPending, isSuccess, isError, messages });

// Group items based on subType and assign translated names to each group
function groupNewObjects(itemsToAdd: IVeoLink[]) {
  return Object.values(
    itemsToAdd.reduce(
      (groups, item) => {
        // Get the translated name for the subtype
        const subType =
          currentDomain.value.raw.elementTypeDefinitions[item.type]?.translations[locale.value]?.[
            `${item.type}_${item.subType}_plural`
          ];
        const sortKey = currentDomain.value.raw.elementTypeDefinitions[item.type].subTypes[item.subType].sortKey ?? 0;

        // If the group for this subtype doesn't exist, create it
        if (!groups[subType]) {
          groups[subType] = { name: subType, items: [], sortKey };
        }
        groups[subType].items.push(item);

        return groups;
      },
      {} as Record<string, { name: string; items: IVeoLink[]; sortKey: number }>
    )
  ).sort((a, b) => a.sortKey - b.sortKey);
}
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-catalog-index.json"></i18n>
