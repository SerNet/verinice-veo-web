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
  <VeoPage :title="$t('breadcrumbs.catalogs')">
    <template #header>
      <p class="mt-4">
        {{ t('hint') }}
      </p>
    </template>
    <template #default>
      <VeoCatalogList
        :catalogs="catalogs"
        :loading="$fetchState.pending"
      />
    </template>
  </VeoPage>
</template>

<script>
import { computed, defineComponent, ref, useContext, useFetch, useRoute } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { separateUUIDParam } from '~/lib/utils';

export default defineComponent({
  setup() {
    const { $api } = useContext();
    const route = useRoute();
    const { t } = useI18n();

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    const catalogs = ref();

    useFetch(async () => {
      catalogs.value = await $api.catalog.fetchAll(domainId.value);
    });

    return {
      catalogs,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "hint": "Please choose the catelog you want to apply items from."
  },
  "de": {
    "hint": "Bitte wählen Sie aus der Liste den Katalog aus, aus dem Sie Einträge anwenden möchten."
  }
}
</i18n>