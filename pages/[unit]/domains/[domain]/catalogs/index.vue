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
  <BasePage :title="$t('breadcrumbs.catalogs')">
    <template #header>
      <p class="mt-4">
        {{ t('hint') }}
      </p>
    </template>
    <template #default>
      <CatalogList
        :catalogs="catalogs"
        :loading="catalogsAreFetching"
      />
    </template>
  </BasePage>
</template>

<script lang="ts" setup>
import { separateUUIDParam } from '~/lib/utils';
import catalogQueryDefinitions from '~/composables/api/queryDefinitions/catalogs';
import { useQuery } from '~~/composables/api/utils/query';


const route = useRoute();
const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

const domainId = computed(() => separateUUIDParam(route.params.domain as string).id);

const fetchCatalogsQueryParameters = computed(() => ({ domainId: domainId.value }));
const { data: catalogs, isFetching: catalogsAreFetching } = useQuery(catalogQueryDefinitions.queries.fetchCatalogs, fetchCatalogsQueryParameters);
</script>

<i18n>
{
  "en": {
    "hint": "Please choose the catalog you want to apply items from."
  },
  "de": {
    "hint": "Bitte wählen Sie aus der Liste den Katalog aus, aus dem Sie Einträge anwenden möchten."
  }
}
</i18n>
