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
  <v-data-table
    :items="displayedItems"
    item-key="id"
    :headers="headers"
    class="veo-report-list"
    :items-per-page="tablePageSize"
    :loading="isFetching"
    @click:row="onRowClicked"
  >
    <template #no-data>
      <span class="text-center">
        {{ t('noReports') }}
      </span>
    </template>
    <template #item.name="{ item }">
      <b>{{ item.raw.name }}</b>
    </template>
    <template #item.description="{ item }">
      <div class="veo-report-list__description">
        <v-tooltip
          v-if="item.descriptionShort"
          location="bottom"
        >
          <template #activator="{ props: tooltipProps }">
            <span
              v-bind="tooltipProps"
              class="veo-report-list__description--description"
            >{{ item.descriptionShort }}</span>
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
  </v-data-table>
</template>
<script setup lang=ts">
import { upperFirst, toUpper } from 'lodash';

import reportQueryDefinitions from '~/composables/api/queryDefinitions/reports';
import { useQuery } from '~~/composables/api/utils/query';

interface IReport {
  id: string;
  name: string;
  description: string;
  multipleTargetsSupported: boolean;
  outputTypes: string;
  targetTypes: string;
}

const emit = defineEmits(['create-report']);

const { t, locale } = useI18n();
const { tablePageSize } = useVeoUser();
const { data: reports, isFetching } = useQuery(reportQueryDefinitions.queries.fetchAll);

const displayedItems = computed<IReport[]>(() => {
  return Object.entries(reports.value || {}).map(([id, item]) => {
    const name = item.name[locale.value] || item.name[0];
    let description = item.description[locale.value] || item.description[0];
    const targetTypes = item.targetTypes.map((type) => upperFirst(type.modelType)).join(', ');
    const outputTypes = item.outputTypes
      .map((type) => {
        const formatParts = type.split('/');
        return formatParts[formatParts.length - 1];
      })
      .join(', ');
    let descriptionShort;

    // For some reason setting a max width on a table cell gets ignored when calculating each columns width, so we have to manipulate the data
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
      multipleTargetsSupported: item.multipleTargetsSupported,
      outputTypes,
      targetTypes,
      descriptionShort
    };
  });
});

const headers = computed(() => {
  return [
    {
      title: t('reportName'),
      value: 'name',
      key: 'name'
    },
    {
      title: t('targetTypes'),
      filterable: false,
      sortable: false,
      value: 'targetTypes',
      key: 'targetTypes'
    },
    {
      title: t('reportDescription'),
      value: 'description',
      key: 'description'
    },
    {
      title: t('outputTypes'),
      value: 'outputTypes',
      key: 'outputTypes'
    }
  ];
});

const onRowClicked = (_event: PointerEvent, context: any) => {
  emit('create-report', context.item.raw);
};
</script>

<i18n>
{
  "en": {
    "noReports": "There are no reports",
    "outputTypes": "Output format",
    "reportDescription": "Description",
    "reportName": "Report type",
    "targetTypes": "Available for"
  },
  "de": {
    "noReports": "Es existieren keine Reports",
    "outputTypes": "Ausgabeformat",
    "reportDescription": "Beschreibung",
    "reportName": "Reporttyp",
    "targetTypes": "Gültig für"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-report-list {
  cursor: pointer;
}

.veo-report-list__description {
  overflow: hidden;
  white-space: nowrap;
}

.veo-report-list__description--description {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
