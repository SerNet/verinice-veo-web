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
  <v-row align="center" justify="center">
    <template v-if="isFetchingReports || isFetchingDomains">
      <v-col cols="12">
        <VSkeletonLoader v-for="i in 5" :key="i" type="image" elevation="2" class="my-6" height="160px" />
      </v-col>
    </template>
    <div v-if="displayedItems && displayedItems.length" class="veo-report-list">
      <template v-for="report in displayedItems" :key="report.id">
        <ReportItem
          :name="report.name"
          :description="report.description"
          :language="report.language"
          :description-short="report.descriptionShort"
          :data-veo-test="`report-${report.id}`"
          @click="emit('create-report', report)"
        />
      </template>
    </div>
  </v-row>
</template>
<script setup lang="ts">
import { upperFirst } from 'lodash';
import type { IVeoDomain } from '~/composables/api/queryDefinitions/domains';
import domainQueryDefinitions, { getSubTypes } from '~/composables/api/queryDefinitions/domains';
import type { IVeoReportMeta, IVeoReportsMeta } from '~/composables/api/queryDefinitions/reports';
import reportQueryDefinitions from '~/composables/api/queryDefinitions/reports';
import { useQuery } from '~/composables/api/utils/query';

interface IReport {
  id: string;
  name: string;
  description: string;
  multipleTargetsSupported: boolean;
  outputTypes: string;
  targetTypes: string;
  language: string;
}

const emit = defineEmits<{
  (e: 'create-report', report: IReport): void;
}>();

const route = useRoute();
const { locale } = useI18n();
const fetchDomainQueryParameters = computed(() => ({
  id: route?.params.domain as string
}));
const fetchDomainQueryEnabled = computed(() => !!route?.params?.domain);
const { data: domain, isFetching: isFetchingDomains } = useQuery(
  domainQueryDefinitions.queries.fetchDomain,
  fetchDomainQueryParameters,
  { enabled: fetchDomainQueryEnabled }
);
const { data: reports, isFetching: isFetchingReports } = useQuery(reportQueryDefinitions.queries.fetchAll);

// Filter reports according to domain only
function filterReportsByDomain(_domain: IVeoDomain, _allReports: IVeoReportsMeta) {
  if (!_domain || !_allReports) return [];

  const allReports = Object.entries(_allReports);
  const reportsInCurrentDomain = allReports.filter(([, report]) => {
    const targetTypesForReport = report.targetTypes || [];
    return targetTypesForReport.some(({ modelType, subTypes }) => {
      // if there is no subType, the report exists in the current domain
      if (!subTypes) return true;
      const subTypesInDomain = getSubTypes(_domain, modelType);
      return subTypesInDomain.some((subTypeInDomain) => subTypes.includes(subTypeInDomain));
    });
  });

  return reportsInCurrentDomain;
}

function prepareReportsData(reports: [id: string, report: IVeoReportMeta][]) {
  if (!reports) return [];

  const result = [];

  for (const [id, report] of reports) {
    // Create entries for each available language
    const availableLanguages = [];
    if (report.name.en || report.description.en) {
      availableLanguages.push('en');
    }
    if (report.name.de || report.description.de) {
      availableLanguages.push('de');
    }

    // If no specific languages, use default
    if (availableLanguages.length === 0) {
      availableLanguages.push('en');
    }

    for (const lang of availableLanguages) {
      const uniqueId = `${id}_${lang}`;
      const name = report.name[lang] || report.name.en || Object.values(report.name)[0];
      const description = report.description[lang] || report.description.en || Object.values(report.description)[0];

      const descriptionShort = description.length > 80 ? description.substring(0, 80) + '...' : description;

      const targetTypes = report.targetTypes
        .map((type) => {
          return upperFirst(type.modelType) || type.modelType;
        })
        .join(', ');
      const outputTypes = report.outputTypes
        .map((type) => {
          const formatParts = type.split('/');
          return formatParts[formatParts.length - 1];
        })
        .join(', ');

      result.push({
        id: uniqueId,
        originalId: id,
        name,
        description,
        descriptionShort,
        multipleTargetsSupported: report.multipleTargetsSupported,
        outputTypes,
        targetTypes,
        language: lang
      });
    }
  }

  return result.sort((a, b) => {
    // Current language items first
    if (a.language === locale.value && b.language !== locale.value) return -1;
    if (a.language !== locale.value && b.language === locale.value) return 1;
    return a.name.localeCompare(b.name);
  });
}

const displayedItems = computed(() => {
  if (!domain.value || !reports.value) {
    return;
  }

  const filteredReports = filterReportsByDomain(toRaw(domain.value), toRaw(reports.value));

  if (filteredReports.length === 0) return;

  return prepareReportsData(filteredReports);
});
</script>
<i18n src="~/locales/base/components/report-list.json"></i18n>
<style lang="scss" scoped>
.veo-report-list {
  width: 80%;
  display: grid;
  gap: 16px;
  padding: 16px;
}
</style>
