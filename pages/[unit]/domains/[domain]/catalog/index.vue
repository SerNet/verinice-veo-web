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
      <CatalogDefaultCatalog
        v-model="selectedItems"
        class="mt-6 mb-4"
        :catalog-items="catalogItems?.items"
        :is-loading="catalogItemsAreFetching"
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
import { useQuery } from '~/composables/api/utils/query';
import { useQuerySync } from '~/composables/api/utils/query';
import { useMutation } from '~/composables/api/utils/mutation';
import catalogQueryDefinitions from '~/composables/api/queryDefinitions/catalogs';
import formsQueryDefinitions from '~/composables/api/queryDefinitions/forms';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { onBeforeRouteLeave } from 'vue-router';

// Types
import type { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import type { IVeoEntity } from '~/types/VeoTypes';

// Composables
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { t, locale } = useI18n();
const route = useRoute();
const { clearCustomBreadcrumbs, addCustomBreadcrumb } = useVeoBreadcrumbs();

// State
const currentDomainId = computed(() => route.params.domain as string);
const currentElementType = computed(() => (route.query.type === 'all' ? undefined : (route.query.type as string)));
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

// Fetch catalog items
const fetchCatalogItemsQueryParameters = computed(() => ({
  domainId: currentDomainId?.value,
  subType: currentSubType?.value,
  size: '10000'
}));

const { data: catalogItems, isFetching: catalogItemsAreFetching } = useQuery(
  catalogQueryDefinitions.queries.fetchCatalogItems,
  fetchCatalogItemsQueryParameters
);

// Translate sub types
// Translations are found in forms, so we fetch them:
const allFormSchemasQueryEnabled = computed(() => !!currentDomainId);
const queryParameters = computed(() => ({
  domainId: currentDomainId.value
}));
const { data: formSchemas } = useQuery(formsQueryDefinitions.queries.fetchForms, queryParameters, {
  enabled: allFormSchemasQueryEnabled,
  placeholderData: []
});

const currentSubTypeTranslated = computed(() =>
  translateSubType({
    formSchemas: formSchemas?.value,
    elementType: currentElementType?.value,
    subType: currentSubType.value
  })
);

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

    const incarnations = await useQuerySync(unitQueryDefinitions.queries.fetchIncarnations, fetchParameters);

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

// Helpers
type TranslateSubTypeParams = {
  formSchemas: IVeoFormSchemaMeta[] | undefined;
  elementType: string | undefined;
  subType: string | undefined;
};

function translateSubType({ formSchemas, elementType, subType }: TranslateSubTypeParams) {
  const formSchema = formSchemas?.find(
    (formSchema) => formSchema.modelType === elementType && formSchema.subType === subType
  );
  return formSchema?.name[locale.value];
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
  }
}
</i18n>
