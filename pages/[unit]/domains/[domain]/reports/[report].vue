<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Tino Groteloh, Jessica Lühnen, Jochen Kemnade, Annemarie Bufe
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
  <BasePage :loading="reportsFetching" data-component-name="report-page" :title="t('breadcrumbs.reports')">
    <template #header>
      <v-row dense class="justify-space-between mt-6">
        <v-col cols="auto">
          <p v-if="report" class="mb-0 text-body-1 font-italic" data-component-name="report-description">
            {{ report.description[locale] }}
          </p>
        </v-col>
      </v-row>
    </template>
    <template #default>
      <LayoutLoadingWrapper v-if="generatingReport" />

      <!-- @vue-ignore TODO #3066 $route does not exist -->
      <ObjectFilterBar
        class="mt-8"
        data-component-name="report-entity-selection-filter-bar"
        :available-object-types="availableObjectTypes"
        :available-sub-types="availableSubTypes"
        :domain-id="$route.params.domain as string"
        :filter="filter"
        :required-fields="requiredFields"
        :disabled-fields="disabledFields"
        @update:filter="updateRouteQuery"
      />

      <p v-if="report" class="text-body-1 my-2">
        {{ report.multipleTargetsSupported ? t('hintMultiple') : t('hintSingle') }}
      </p>

      <BaseCard>
        <ObjectTable
          v-model:page="page"
          v-model:sort-by="sortBy"
          :model-value="selectedObjects"
          show-select
          :default-headers="[
            'icon',
            'designator',
            'abbreviation',
            'name',
            'status',
            'description',
            'updatedBy',
            'updatedAt',
            'actions'
          ]"
          :items="objects"
          :loading="objectsFetching"
          data-component-name="report-entity-selection"
          @update:model-value="onReportSelectionUpdated"
        />
      </BaseCard>
      <v-row no-gutters class="mt-4">
        <v-spacer />
        <v-col cols="auto">
          <v-btn
            flat
            color="primary"
            :disabled="generatingReport || !selectedObjects.length"
            data-component-name="generate-report-button"
            @click="generateReport"
          >
            {{ t('generateReport') }}
          </v-btn>
          <a ref="downloadButton" :aria-label="t('generateReport')" href="#" />
        </v-col>
      </v-row>
    </template>
  </BasePage>
</template>

<script lang="ts">
import { omit, upperCase, upperFirst } from 'lodash';

import { QueryClient } from '@tanstack/vue-query';
import { RouteRecordName } from 'vue-router';
import { useFetchObjects } from '~/composables/api/objects';
import reportQueryDefinitions from '~/composables/api/queryDefinitions/reports';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery } from '~/composables/api/utils/query';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useVeoUser } from '~/composables/VeoUser';
import { IVeoEntity, VeoElementTypePlurals } from '~/types/VeoTypes';

export const ROUTE_NAME = 'unit-domains-domain-reports-report';
export default defineComponent({
  name: 'VeoReportPage',
  setup() {
    const { t, locale } = useI18n();
    const route = useRoute();
    const { displayErrorMessage } = useVeoAlerts();
    const { tablePageSize } = useVeoUser();

    const outputType = computed<string>(() => report.value?.outputTypes?.[0] || '');

    const title = computed(() =>
      t('create', {
        type: report.value?.name?.[locale.value] || '',
        format: upperCase(outputType.value.split('/').pop())
      }).toString()
    );

    // Fetching the right report
    const requestedReportName = computed(() => route.params.report as string);

    const { data: reports, isFetching: reportsFetching } = useQuery(reportQueryDefinitions.queries.fetchAll);
    const report = computed(() => reports.value?.[requestedReportName.value]);

    const availableObjectTypes = computed<string[]>(() =>
      (report.value?.targetTypes || []).map((targetType) => targetType.modelType)
    );
    const availableSubTypes = computed<string[]>(
      () =>
        (report.value?.targetTypes || []).find((targetType) => targetType.modelType === filter.value.objectType)
          ?.subTypes || []
    );

    // Table stuff
    const selectedObjects = ref<{ id: string; type: string }[]>([]);

    const page = ref(0);
    const sortBy = ref([{ key: 'name', order: 'asc' }]);
    const resetQueryOptions = () => {
      page.value = 0;
      sortBy.value = [{ key: 'name', order: 'asc' }];
    };

    const requiredFields = computed(() =>
      availableSubTypes.value.length ? ['objectType', 'subType'] : ['objectType']
    );

    const disabledFields = ['objectType'];

    // accepted filter keys (others wont be respected when specified in URL query parameters)
    const filterKeys = [
      'objectType',
      'abbreviation',
      'subType',
      'designator',
      'name',
      'status',
      'description',
      'updatedBy',
      'hasNoParentElements',
      'hasChildElements'
    ] as const;

    // filter built from URL query parameters
    const filter = computed(() => {
      const query = route.query;

      let filterObject = Object.fromEntries(
        filterKeys.map((key) => {
          // Extract first query value
          const val = ([] as (string | null)[]).concat(query[key]).shift();
          return [key, val === null ? true : val];
        })
      );

      const fixedSubTypes = report?.value?.targetTypes?.[0]?.subTypes || [];
      filterObject = {
        ...filterObject,
        objectType: report?.value?.targetTypes?.[0]?.modelType,
        subType: fixedSubTypes.length === 1 ? fixedSubTypes[0] : undefined
      };
      return filterObject;
    });

    watch(() => filter.value, resetQueryOptions, { deep: true });

    const endpoint = computed(() => VeoElementTypePlurals[filter.value.objectType as string]);
    const combinedObjectsQueryParameters = computed<any>(() => ({
      size: tablePageSize.value,
      sortBy: sortBy.value[0].key,
      sortOrder: sortBy.value[0].order,
      page: page.value,
      unit: route.params.unit as string,
      ...omit(filter.value, 'objectType'),
      endpoint: endpoint.value
    }));
    const objectType = computed<string | undefined>(() => filter.value.objectType as string | undefined);
    const objectsQueryEnabled = computed(() => !!objectType.value && !!endpoint.value);

    const {
      data: objects,
      isLoading: objectsFetching,
      refetch: refetchObjects
    } = useFetchObjects(combinedObjectsQueryParameters as any, {
      enabled: objectsQueryEnabled,
      keepPreviousData: true,
      placeholderData: []
    });

    const updateRouteQuery = async (v: Record<string, string | undefined | null | true>, reset = true) => {
      const resetValues = reset ? filterKeys.map((key) => [key, undefined as string | undefined | null]) : [];
      const newValues = Object.fromEntries(
        resetValues.concat(Object.entries(v).map(([k, v]) => [k, v === true ? null : v]))
      );
      const query = { ...route.query, ...newValues };
      // obsolete params need to be removed from the query to match the route exactly in the NavigationDrawer
      Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);
      await navigateTo({
        ...route,
        // @ts-ignore TODO #3066 does not exist
        name: route.name as RouteRecordName | undefined,
        query
      });
    };

    // Generating new report
    const downloadButton = ref<HTMLAnchorElement>();
    const openReport = (_queryClient: QueryClient, result: any) => {
      if (!downloadButton.value || !report.value) {
        return;
      }

      downloadButton.value.href = URL.createObjectURL(result);
      downloadButton.value.download = `${report.value.name[locale.value]}.${outputType.value.split('/').pop()}`;
      downloadButton.value.click();
    };

    const createMutationParameters = computed(() => ({
      type: requestedReportName.value,
      body: {
        outputType: outputType.value,
        targets: selectedObjects.value,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }));
    const { mutateAsync: create, isLoading: generatingReport } = useMutation(reportQueryDefinitions.mutations.create, {
      onSuccess: openReport
    });

    const generateReport = async () => {
      if (report.value) {
        try {
          await create(createMutationParameters);
        } catch (error: any) {
          displayErrorMessage(t('generateReportError').toString(), error.message);
        }
      }
    };

    const onReportSelectionUpdated = (newObjects: IVeoEntity[]) => {
      if (newObjects?.length) {
        selectedObjects.value = [newObjects[0]];
      } else {
        selectedObjects.value = [];
      }
    };

    return {
      availableObjectTypes,
      availableSubTypes,
      downloadButton,
      filter,
      generateReport,
      generatingReport,
      objects,
      objectsFetching,
      onReportSelectionUpdated,
      selectedObjects,
      sortBy,
      page,
      refetchObjects,
      report,
      reportsFetching,
      requiredFields,
      disabledFields,
      title,
      updateRouteQuery,
      t,
      locale,
      upperFirst
    };
  }
});
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-reports-report.json"></i18n>
