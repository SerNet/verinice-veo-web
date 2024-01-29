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
  <BaseTable
    :items="displayedItems"
    item-key="id"
    :additional-headers="headers"
    class="veo-report-list"
    :items-per-page="tablePageSize"
    :loading="isFetchingReports || isFetchingDomains"
    @click:row="onRowClicked"
  >
    <template #no-data>
      <span class="text-center">
        {{ t('noReports') }}
      </span>
    </template>
    <template #item.description="{ item }">
      <div class="veo-report-list__description">
        <v-tooltip v-if="item.descriptionShort" location="bottom">
          <template #activator="{ props: tooltipProps }">
            <span
              v-bind="tooltipProps"
              class="veo-report-list__description--description"
              >{{ item.descriptionShort }}</span
            >
          </template>
          <template #default>
            <span>{{ item.raw.description }}</span>
          </template>
        </v-tooltip>
        <span v-else>{{ item.raw.description }}</span>
      </div>
    </template>
    <template #item.outputTypes="{ item }">
      {{ toUpper(item.raw.outputTypes) }}
    </template>
  </BaseTable>
</template>
<script setup lang="ts">
import { upperFirst, toUpper } from 'lodash';

import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import reportQueryDefinitions from '~/composables/api/queryDefinitions/reports';
import { useQuery, useQuerySync } from '~/composables/api/utils/query';

import type { IVeoReport } from '~/types/VeoTypes';
import type { IVeoDomain } from '~/composables/api/queryDefinitions/domains';

interface IReport {
  id: string;
  name: string;
  description: string;
  multipleTargetsSupported: boolean;
  outputTypes: string;
  targetTypes: string;
}

const emit = defineEmits<{
  (e: 'create-report', report: IReport): void;
}>();

const { t, locale } = useI18n();
const { tablePageSize } = useVeoUser();

const route = useRoute();
const fetchDomainQueryParameters = computed(() => ({
  id: route?.params.domain as string,
}));
const fetchDomainQueryEnabled = computed(() => !!route?.params?.domain);
const { data: domain, isFetching: isFetchingDomains } = useQuery(
  domainQueryDefinitions.queries.fetchDomain,
  fetchDomainQueryParameters,
  { enabled: fetchDomainQueryEnabled }
);
const { data: reports, isFetching: isFetchingReports } = useQuery(
  reportQueryDefinitions.queries.fetchAll
);

/**
 * Filter reports according to domain and GUI language.
 * @param _domain {IVeoDomain} - The currently active veo domain.
 * @param _allReports {IVeoReport[]} - All reports from all domains.
 * @param _locale {string} - The current GUI language.
 */
type TFilterReportsParams = {
  _domain: IVeoDomain;
  _allReports: IVeoReport[];
  _locale: string;
};
function filterReports({
  _domain,
  _allReports,
  _locale,
}: TFilterReportsParams) {
  if (!_domain || !_allReports) return [];

  const allReports = Object.entries(_allReports || {});
  const reportsInCurrentDomain =
    domain.value === null ?
      []
    : allReports.filter(([, report]) => {
        const targetTypesForReport = report.targetTypes;
        return targetTypesForReport.some(({ modelType, subTypes }) => {
          // if there is no subType, the report exists in the current domain
          if (subTypes === null) return true;
          const subTypesInDomain = Object.keys(
            _domain.elementTypeDefinitions[modelType].subTypes
          );
          return subTypesInDomain.some(
            (subTypeInDomain) => subTypes.indexOf(subTypeInDomain) >= 0
          );
        });
      });

  // Return reports in current GUI language only
  return reportsInCurrentDomain.filter((r) => {
    const [, report] = r;
    return report.name?.[_locale] !== undefined;
  });
}

/*
 * Prepare report data so it can be rendered into a table.
 * @param reports {TReports} - An array of reports.
 * @param locale {string}- The current locale.
 */
type TMapFilteredReportsParams = {
  reports: [id: string, report: IVeoReport][];
  locale: string;
};
function mapFilterdReports({ reports, locale }: TMapFilteredReportsParams) {
  if (!reports || !locale) return [];
  return reports.map((r) => {
    const [id, report] = r;

    const name = report.name[locale] || Object.values(report.name)[0];
    const targetTypes = report.targetTypes
      .map((type) => upperFirst(type.modelType))
      .join(', ');
    const outputTypes = report.outputTypes
      .map((type) => {
        const formatParts = type.split('/');
        return formatParts[formatParts.length - 1];
      })
      .join(', ');

    // For some reason setting a max width on a table cell gets ignored when calculating each columns width, so we have to manipulate the data
    let descriptionShort;
    let description =
      report.description[locale] ||
      Object.values(report.description)[0] ||
      t('noDescriptionAvailable');
    if (description.length > 80) {
      descriptionShort = description.substring(0, 80) + '...';

      if (description.length > 1000) {
        description = description.substring(0, 1000) + '...';
      }
    }

    return {
      id,
      name,
      description,
      multipleTargetsSupported: report.multipleTargetsSupported,
      outputTypes,
      targetTypes,
      descriptionShort,
    };
  });
}

const displayedItems = computed(() => {
  const _locale = locale.value;
  const filteredReports = filterReports({
    _domain: toRaw(domain.value),
    _allReports: toRaw(reports.value),
    _locale,
  });

  if (filterReports.length === 0) return;

  return mapFilterdReports({ reports: filteredReports, locale: _locale });
});

const headers = computed(() => {
  return [
    {
      title: t('reportName'),
      value: 'name',
      key: 'name',
      cellClass: ['font-weight-bold'],
      width: 300,
      truncate: true,
      sortable: true,
      priority: 100,
      order: 10,
    },
    {
      text: t('targetTypes'),
      value: 'targetTypes',
      key: 'targetTypes',
      priority: 90,
      order: 20,
    },
    {
      title: t('reportDescription'),
      value: 'description',
      key: 'description',
      sortable: false,
      width: 600,
      truncate: true,
      tooltip: ({ internalItem: item }: { internalItem: any }) =>
        item.raw.description || '',
      priority: 30,
      order: 30,
    },
    {
      text: t('outputTypes'),
      value: 'outputTypes',
      key: 'outputTypes',
      priority: 80,
      order: 40,
    },
  ];
});

const onRowClicked = (_event: PointerEvent, context: any) => {
  emit('create-report', context.internalItem.raw);
};
</script>

<i18n>
{
  "en": {
    "noReports": "There are no reports",
    "noDescriptionAvailable": "N/A",
    "outputTypes": "Output format",
    "reportDescription": "Description",
    "reportName": "Report type",
    "targetTypes": "Available for"
  },
  "de": {
    "noReports": "Es existieren keine Reports",
    "noDescriptionAvailable": "N/A",
    "outputTypes": "Ausgabeformat",
    "reportDescription": "Beschreibung",
    "reportName": "Reporttyp",
    "targetTypes": "Gültig für"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-report-list__description {
  overflow: hidden;
  white-space: nowrap;
}

.veo-report-list__description--description {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
