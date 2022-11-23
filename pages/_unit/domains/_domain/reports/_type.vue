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
  <VeoPage
    :title="title"
    :loading="reportsFetching"
    data-component-name="report-page"
  >
    <template #header>
      <v-row
        dense
        class="justify-space-between"
      >
        <v-col cols="auto">
          <p
            v-if="report"
            class="mt-2 mb-0 text-body-1"
            data-component-name="report-description"
          >
            {{ report.description[locale] }}
          </p>
        </v-col>
      </v-row>
    </template>
    <template #default>
      <VeoLoadingWrapper v-if="generatingReport" />
      <p
        v-if="report && report.multipleTargetsSupported"
        class="text-body-1"
      >
        {{ t('hintMultiple') }}
      </p>
      <p
        v-else-if="report"
        class="text-body-1"
      >
        {{ t('hintSingle') }}
      </p>
      <VeoObjectFilterBar
        data-component-name="report-entity-selection-filter-bar"
        :domain-id="domainId"
        :filter="filter"
        :required-fields="requiredFields"
        :available-object-types="availableObjectTypes"
        :available-sub-types="availableSubTypes"
        @update:filter="updateRouteQuery"
      />
      <VeoCard>
        <VeoObjectTable
          v-model="selectedObjects"
          show-select
          checkbox-color="primary"
          :default-headers="['icon', 'designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt', 'actions']"
          :items="objects"
          :loading="objectsFetching"
          single-select
          data-component-name="report-entity-selection"
          @page-change="onPageChange"
        />
      </VeoCard>
      <v-row
        no-gutters
        class="mt-4"
      >
        <v-spacer />
        <v-col cols="auto">
          <v-btn
            depressed
            color="primary"
            :disabled="generatingReport || !selectedObjects.length"
            data-component-name="generate-report-button"
            @click="generateReport"
          >
            {{ t('generateReport') }}
          </v-btn>
          <a
            ref="downloadButton"
            href="#"
          />
        </v-col>
      </v-row>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, useRoute, useRouter, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperCase, upperFirst } from 'lodash';

import { separateUUIDParam } from '~/lib/utils';
import { useCreateReport, useFetchReports } from '~/composables/api/reports';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useFetchObjects } from '~/composables/api/objects';
import { useVeoUser } from '~/composables/VeoUser';

export const ROUTE_NAME = 'unit-domains-domain-reports-type';

export default defineComponent({
  name: 'VeoReportPage',
  setup() {
    const { t, locale } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const { displayErrorMessage } = useVeoAlerts();
    const { tablePageSize } = useVeoUser();

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    const outputType = computed<string>(() => report.value?.outputTypes?.[0] || '');

    const title = computed(() => t('create', { type: report.value?.name?.[locale.value] || '', format: upperCase(outputType.value.split('/').pop()) }).toString());

    // Fetching the right report
    const requestedReportName = computed(() => route.value.params.type);

    const { data: reports, isFetching: reportsFetching } = useFetchReports();
    const report = computed(() => reports.value?.[requestedReportName.value]);

    const availableObjectTypes = computed<string[]>(() => (report.value?.targetTypes || []).map((targetType) => targetType.modelType));
    const availableSubTypes = computed<string[]>(() => (report.value?.targetTypes || []).find((targetType) => targetType.modelType === filter.value.objectType)?.subTypes || []);

    // Table stuff
    const selectedObjects = ref<{ id: string; type: string }[]>([]);

    const objectsQueryParameters = reactive({ page: 1, sortBy: 'name', sortDesc: false });
    const resetQueryOptions = () => {
      Object.assign(objectsQueryParameters, { page: 1, sortBy: 'name', sortDesc: false });
      refetchObjects(); // A dirty workaround, as vue-query doesn't pick up changes to the query key. Hopefully solved with nuxt 3
    };

    const requiredFields = computed(() => (availableSubTypes.value.length ? ['objectType', 'subType'] : ['objectType']));

    // accepted filter keys (others wont be respected when specified in URL query parameters)
    const filterKeys = ['objectType', 'subType', 'designator', 'name', 'status', 'description', 'updatedBy', 'notPartOfGroup', 'hasChildObjects'] as const;

    // filter built from URL query parameters
    const filter = computed(() => {
      const query = route.value.query;

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

    const combinedObjectsQueryParameters = computed(() => ({
      size: tablePageSize.value,
      sortBy: objectsQueryParameters.sortBy,
      sortOrder: objectsQueryParameters.sortDesc ? 'desc' : 'asc',
      page: objectsQueryParameters.page,
      unit: separateUUIDParam(route.value.params.unit).id,
      ...filter.value
    }));
    const objectsQueryEnabled = computed(() => !!filter.value.objectType);

    const {
      data: objects,
      isFetching: objectsFetching,
      refetch: refetchObjects
    } = useFetchObjects(combinedObjectsQueryParameters as any, { enabled: objectsQueryEnabled, keepPreviousData: true });

    const updateRouteQuery = async (v: Record<string, string | undefined | null | true>, reset = true) => {
      const resetValues = reset ? filterKeys.map((key) => [key, undefined as string | undefined | null]) : [];
      const newValues = Object.fromEntries(resetValues.concat(Object.entries(v).map(([k, v]) => [k, v === true ? null : v])));
      const query = { ...route.value.query, ...newValues };
      // obsolete params need to be removed from the query to match the route exactly in the NavigationDrawer
      Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);
      await router.push({ ...route.value, name: route.value.name!, query });
    };

    // refetch entities on page or sort changes (in VeoObjectTable)
    const onPageChange = (opts: { newPage: number; sortBy: string; sortDesc?: boolean }) => {
      Object.assign(objectsQueryParameters, { page: opts.newPage, sortBy: opts.sortBy, sortDesc: !!opts.sortDesc });
      refetchObjects(); // A dirty workaround, as vue-query doesn't pick up changes to the query key. Hopefully solved with nuxt 3
    };

    // Generating new report
    const downloadButton = ref<HTMLAnchorElement>();
    const openReport = (result: any) => {
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
        targets: selectedObjects.value
      }
    }));
    const { mutateAsync: create, isLoading: generatingReport } = useCreateReport(createMutationParameters, { onSuccess: openReport });

    const generateReport = () => {
      if (report.value) {
        try {
          create();
        } catch (error: any) {
          displayErrorMessage(t('generateReportError').toString(), error.message);
        }
      }
    };

    return {
      availableObjectTypes,
      availableSubTypes,
      domainId,
      downloadButton,
      filter,
      generateReport,
      generatingReport,
      objects,
      objectsFetching,
      onPageChange,
      selectedObjects,
      refetchObjects,
      report,
      reportsFetching,
      requiredFields,
      title,
      updateRouteQuery,

      t,
      locale,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "create": "Create {type} ({format})",
    "generateReport": "Generate report",
    "generateReportError": "Couldn't generate report",
    "hintMultiple": "Please select the object you want to create the report for.",
    "hintSingle": "Please select the object you want to create the report for."
  },
  "de": {
    "create": "{type} ({format}) erstellen",
    "generateReport": "Report generieren",
    "generateReportError": "Report konnte nicht erstellt werden",
    "hintMultiple": "Bitte wählen Sie die Objekte aus, für die Sie den Report erstellen möchten.",
    "hintSingle": "Bitte wählen Sie das Objekt aus, für das Sie den Report erstellen möchten."
  }
}
</i18n>
