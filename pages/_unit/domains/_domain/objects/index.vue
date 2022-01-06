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
    :title="t('objects')"
    fullsize
    :loading="fetchState.pending"
  >
    <VeoFilterDialog
      v-model="filterDialogVisible"
      :domain="domainId"
      :filter="filter"
      @update:filter="updateRouteQuery"
    />
    <div class="d-flex my-2">
      <h2>Alle Objekte</h2>
      <v-spacer />
      <v-btn
        color="primary"
        text
      >
        <v-icon left>
          mdi-plus
        </v-icon>
        <span>{{ t('createObject', [objectType]) }}</span>
      </v-btn>
    </div>
    <v-row no-gutters>
      <v-col
        cols="11"
        class="grow"
      >
        <v-chip-group>
          <VeoObjectChip
            v-for="label in activeFilterKeys"
            :key="label"
            :label="upperFirst(t(`objectlist.${label}`).toString())"
            :value="filter[label]"
            @click:close="clearFilter(label)"
          />
        </v-chip-group>
      </v-col>
      <v-col
        cols="1"
        class="shrink text-right"
      >
        <v-btn
          class="ma-1"
          icon
          @click="showFilterDialog"
        >
          <v-icon>mdi-filter</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <VeoObjectTable
      v-if="!fetchState.error"
      :items="items"
      :loading="fetchState.pending"
      @page-change="onPageChange"
    />
    <VeoObjectTypeError v-else>
      <v-btn
        color="primary"
        text
        @click="showFilterDialog"
      >
        {{ t('filterObjects') }}
      </v-btn>
    </VeoObjectTypeError>
  </VeoPage>
</template>

<script lang="ts">
import { useI18n } from 'nuxt-i18n-composable';
import { computed, defineComponent, useContext, useFetch, useAsync, useRoute, useRouter, ref, reactive, watch } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { separateUUIDParam } from '~/lib/utils';
import { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const { $api, i18n } = useContext();
    const route = useRoute();
    const router = useRouter();

    const items = ref<IVeoPaginatedResponse<IVeoEntity[]>>();

    const filterDialogVisible = ref(false);

    // accepted filter keys (others wont be respected when specified in URL query parameters)
    const filterKeys = ['objectType', 'subType', 'designator', 'name', 'status', 'description', 'updatedBy', 'notPartOfGroup', 'hasChildObjects', 'hasLinks'] as const;
    type FilterKey = typeof filterKeys[number];

    // retrieve translations
    // const translations = useAsync(() => $api.translation.fetch(i18n.locales.map((l) => (typeof l === 'string' ? l : l.code) as any)), 'translations');

    // filter built from URL query parameters
    const filter = computed(() => {
      const query = route.value.query;
      return Object.fromEntries(
        filterKeys.map((key) => {
          // Extract first query value
          const val = ([] as (string | null)[]).concat(query[key]).shift();
          return [key, val === null ? true : val];
        })
      ) as Record<FilterKey, string | undefined>;
    });

    // filters that have a value (and will be displayed as chips)
    const activeFilterKeys = computed(() => filterKeys.filter((k) => filter.value[k] !== undefined));

    // pagination parameters (page and sorting), set by VeoObjectTable
    const pagination = reactive({ page: 1, sortBy: undefined as string | undefined, sortOrder: undefined as string | undefined });

    // current object type
    const objectType = computed(() => filter.value.objectType);
    // fetch objects of objectType
    const { fetchState, fetch } = useFetch(async () => {
      const objectType = filter.value.objectType;
      // objectType has to be defined
      if (!objectType) throw new Error('The object type was not specified');
      const params = { ...filter.value, ...pagination, page: undefined };
      delete params.objectType;
      delete params.page;
      items.value = await $api.entity.fetchAll(objectType, pagination.page, params);
    });

    // refetch on changes via FilterDialog or URL query parameters
    watch(filter, fetch);

    // parse UUID from URL
    const domainId = computed(() => {
      return separateUUIDParam(route.value.params.domain).id;
    });

    // display FilterDialog
    const showFilterDialog = () => {
      filterDialogVisible.value = true;
    };

    // Update query parameters but keep other route options
    const updateRouteQuery = async (v: Record<string, string | undefined | null | true>, reset = true) => {
      const resetValues = reset ? filterKeys.map((key) => [key, undefined as string | undefined | null]) : [];
      const newValues = Object.fromEntries(resetValues.concat(Object.entries(v).map(([k, v]) => [k, v === true ? null : v])));

      await router.push({ ...route.value, name: route.value.name || '', query: { ...route.value.query, ...newValues } });
    };

    // Remove a filter by removing it from query params
    const clearFilter = (key: FilterKey) => {
      updateRouteQuery({ [key]: undefined }, false);
    };

    // refetch on page or sort changes (in VeoObjectTable)
    const onPageChange = (opts: { newPage: number; sortBy: string; sortDesc?: boolean }) => {
      pagination.page = opts.newPage;
      pagination.sortBy = opts.sortBy;
      pagination.sortOrder = opts.sortDesc === undefined ? undefined : opts.sortDesc ? 'desc' : 'asc';
      return fetch();
    };

    return {
      t,
      domainId,
      activeFilterKeys,
      clearFilter,
      fetchState,
      filter,
      filterDialogVisible,
      items,
      objectType,
      onPageChange,
      showFilterDialog,
      updateRouteQuery,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "objects": "objects",
    "filterObjects": "filter objects",
    "createObject": "create {0}"
  },
  "de": {
    "objects": "Objekte",
    "filterObjects": "Objekte filtern",
    "createObject": "{0} erstellen"
  }
}
</i18n>