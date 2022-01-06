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
    <template
      v-if="!loading && object"
      #header
    >
      <div class="px-4">
        <h1>
          {{ upperFirst(t('objects').toString()) }}
        </h1>
        <h2>
          {{ object.displayName }}
        </h2>
      </div>
    </template>
    <template #default>
      <VeoObjectDetails
        :loading="loading"
        :object="object"
      />
      <VeoPage
        fullsize
        content-class="fill-height"
        no-padding
      >
        <template #default>
          <VeoObjectForm
            v-model="object"
            :objectschema="objectschema"
            :loading="loading"
            :domain-id="domainId"
          />
        </template>
      </VeoPage>
    </template>
    
  </VeoPageWrapper>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch, useRoute, Ref } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoEntity, IVeoObjectSchema } from '~/types/VeoTypes';

export default defineComponent({
  name: 'VeoObjectsIndexPage',
  setup() {
    const { t } = useI18n();
    const { $api } = useContext();
    const route = useRoute();

    const pageWidths = ref<Number[]>([4, 8]);
    const pageTitles = ref<string[]>([t('objectInfo').toString(), t('objectForm').toString()]);

    const onPageCollapsed = (collapsedPages: Boolean[]) => {
      if (collapsedPages.some((page) => page)) {
        pageWidths.value = [12, 0];
      } else {
        pageWidths.value = [3, 9];
      }
    };

    const objectParameter = computed(() => {
      return separateUUIDParam(route.value.params.id);
    });
    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    const object = ref<IVeoEntity | undefined>(undefined);
    const objectschema: Ref<IVeoObjectSchema | undefined> = ref(undefined);

    const { fetchState } = useFetch(async () => {
      object.value = await $api.entity.fetch(objectParameter.value.type, objectParameter.value.id);
      objectschema.value = await $api.schema.fetch(objectParameter.value.type, [domainId.value]);
    });

    const notFoundError = computed(() => (fetchState.error as any)?.statusCode === 404);

    return {
      domainId,
      t,
      pageWidths,
      pageTitles,
      onPageCollapsed,
      loading: fetchState.pending,
      notFoundError,
      object,
      objectschema,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "objectInfo": "objekt details",
    "objectForm": "form",
    "objects": "objects"
  },
  "de": {
    "objectInfo": "Objektdetails",
    "objectForm": "Formular",
    "objects": "Objekte"
  }
}
</i18n>
