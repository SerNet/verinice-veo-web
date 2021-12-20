<!--
   - verinice.veo web
   - Copyright (C) 2021  Samuel Vitzthum
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
  <VeoObjectNotFound v-if="!loading && notFoundError"/>
  <VeoPageWrapper
    v-else
    collapsable-left
    collapsable-right
    :page-widths="pageWidths"
    :page-titles="pageTitles"
    @page-collapsed="onPageCollapsed">
    <VeoObjectDetails
      :loading="loading"
      :object="object"
    />
    <VeoObjectForm
      :loading="loading"
      :object="object"
      :show-header="pageWidths[1] === 0"
    />
  </VeoPageWrapper>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch, useRoute } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoEntity } from '~/types/VeoTypes';

export default defineComponent({
  name: 'VeoObjectsIndexPage',
  setup() {
    const { t } = useI18n();
    const { $api } = useContext();
    const route = useRoute();

    const pageWidths = ref<Number[]>([6, 6]);
    const pageTitles = ref<string[]>([t('objectInfo').toString(), t('objectForm').toString()]);

    const onPageCollapsed = (collapsedPages: Boolean[]) => {
      if (collapsedPages.some((page) => page)) {
        pageWidths.value = [12, 0];
      } else {
        pageWidths.value = [6, 6];
      }
    };

    const objectParameter = computed(() => {
      return separateUUIDParam(route.value.params.id);
    });
    const object = ref<IVeoEntity | undefined>(undefined);

    const { fetchState } = useFetch(async () => {
      object.value = await $api.entity.fetch(objectParameter.value.type, objectParameter.value.id);
    });

    const notFoundError = computed(() => (fetchState.error as any)?.statusCode === 404);

    return {
      t,
      pageWidths,
      pageTitles,
      onPageCollapsed,
      loading: fetchState.pending,
      notFoundError,
      object
    };
  }
});
</script>

<i18n>
{
  "en": {
    "objectInfo": "objekt details",
    "objectForm": "form"
  },
  "de": {
    "objectInfo": "Objektdetails",
    "objectForm": "Formular"
  }
}
</i18n>
