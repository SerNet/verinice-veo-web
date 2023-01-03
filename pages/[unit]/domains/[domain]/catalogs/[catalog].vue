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
  <VeoPage
    :title="title"
    data-component-name="catalog-page"
  >
    <template #default>
      <VeoTabs class="mt-6">
        <template #tabs>
          <v-tab data-component-name="catalog-hazards-tab">
            {{ t('applyEntries') }}
          </v-tab>
          <v-tab data-component-name="catalog-tom-tab">
            {{ t('applyTOMs') }}
          </v-tab>
        </template>
        <template #items>
          <v-tab-item>
            <VeoDefaultCatalog
              :catalog-items="scenarios"
              :loading="$fetchState.pending"
              :success-text="t('scenariosApplied').toString()"
              :error-text="t('applyScenariosError').toString()"
            >
              <template #header>
                {{ t('selectScenariosCTA') }}
              </template>
            </VeoDefaultCatalog>
          </v-tab-item>
          <v-tab-item>
            <VeoDefaultCatalog
              :catalog-items="toms"
              :loading="$fetchState.pending"
              :success-text="t('TOMsApplied').toString()"
              :error-text="t('applyTOMsError').toString()"
            >
              <template #header>
                {{ t('selectTOMsCTA') }}
              </template>
            </VeoDefaultCatalog>
          </v-tab-item>
        </template>
      </VeoTabs>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { separateUUIDParam } from '~/lib/utils';
import { useFetchCatalogItems } from '~~/composables/api/catalogs';

export const ROUTE_NAME = 'unit-domains-domain-catalogs-catalog';

export default defineComponent({
  name: 'VeoCatalogPage',
  setup() {
    const { t } = useI18n();
    const route = useRoute();

    const title = computed(() => t('catalog', { name: catalogItems.value?.[0]?.catalog?.displayName || '' }));

    const domainId = computed(() => separateUUIDParam(route.params.domain as string).id);
    const catalogId = computed(() => separateUUIDParam(route.params.catalo as string).id);

    const scenarios = computed(() =>
      // VVT is needed by the backend, however it shouldn't be selectable by the user as this throws an error
      catalogItems.value.filter((catalogItem) => !catalogItem.element.displayName?.includes('TOM-') && !catalogItem.element.displayName?.includes('VVT'))
    );
    const toms = computed(() => catalogItems.value.filter((catalogItem) => catalogItem.element.displayName?.includes('TOM-')));

    const fetchCatalogItemsQueryParameters = computed(() => ({ catalogId: catalogId.value, domainId: domainId.value }));
    const { data: catalogItems } = useFetchCatalogItems(fetchCatalogItemsQueryParameters);

    return {
      scenarios,
      title,
      toms,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "applyEntries": "apply scenarios",
    "applyScenariosError": "Couldn't apply scenarios",
    "applyTOMs": "apply TOMs",
    "applyTOMsError": "Couldn't apply TOMs",
    "catalog": "Catalog {name}",
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
    "catalog": "Katalog {name}",
    "scenariosApplied": "Gefährdungen wurden erfolgreich angewandt",
    "selectScenariosCTA": "Bitte wählen Sie die Gefährdungen aus, die Sie anwenden möchten.",
    "selectTOMsCTA": "Wählen Sie eine oder mehrere technische und organisatorische Maßnahmen aus, die angewendet werden sollen.",
    "TOMsApplied": "TOMs wurden angewendet"
  }
}
</i18n>
