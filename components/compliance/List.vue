<template>
  <BaseTable
    :items="requirementImplementations"
    item-key="id"
    :additional-headers="headers"
  >
    <!--
    class="veo-report-list"
    :items-per-page="tablePageSize"
    :loading="isFetching"
    @click:row="onRowClicked"
    -->
    <template #no-data>
      <span class="text-center">
        {{ t('noRequirementImplementations') }}
      </span>
    </template>
    <!--
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
    -->
  </BaseTable>
</template>

<script setup lang="ts">
import { TableHeader } from '../base/Table.vue';
const { t } = useI18n();

// Table setup
/*
Abkürzung: Abkürzung der Anforderung
Anforderung: Titel der Anforderung
Umsetzungsherkunft: Herkunft der Umsetzung [ Systemspezifisch | Vererbung | Organisation ]
Verantwortlich: Abkürzung der verantwortlichen Person
Status: Status der Umsetzung [ Unbearbeitet | Ja | Teilweise | Nein | Nicht anwendbar ]
*/

const headers: TableHeader[] = [
  // { title: t('thAbbreviation'), align: 'start', key: 'name'},
  {
    value: t('thName'), // Values seem to be set in BaseTable (only pass string here?)
    key: 'control.displayName',
    sortable: false,
    priority: 60,
    order: 30
  },
  {
    value: t('thOrigin'),
    align: 'start',
    key: 'origination',
    priority: 60,
    order: 30
  },
  {
    value: t('thResponsibleBody'),
    align: 'start',
    key: 'responsible.displayName',
    priority: 60,
    order: 30
  },
  {
    value: t('thStatus'),
    align: 'start',
    key: 'implementationStatus',
    priority: 60,
    order: 30
  }
];


/**************** >>>
/**************** >>>
riskAffected: Lohnabrechnung
assetId: 910c01e8-6413-425f-a08c-4896981d3d63
load asset:

/api/domains/{domainId}/assets/{uuid}

rist
/**************** >>> */

// check asset + find out, if we have any control implementations
const aId = '910c01e8-6413-425f-a08c-4896981d3d63';
const route = useRoute();

const domainId = computed(() => route.params.domain);
const url = '/api/processes/910c01e8-6413-425f-a08c-4896981d3d63/control-implementations/e043d69b-b4c4-457e-9e96-5a46046a8bb7/requirement-implementations';
const requirementImplementations = await request(url, {});

console.log({requirementImplementations});

</script>

<i18n>
{
"en": {
  "thAbbreviation": "Abkürzung",
  "thName": "Anforderung",
  "thOrigin": "Umsetzungsherkunft",
  "thResponsibleBody": "Verantwortlich",
  "thStatus": "Status"
},
"de": {
  "thAbbreviation": "Abkürzung",
  "thName": "Anforderung",
  "thOrigin": "Umsetzungsherkunft",
  "thResponsibleBody": "Verantwortlich",
  "thStatus": "Status"
}
}
</i18n>

<style>
/* Do not show a checkbox in table header */
#profileStyleScope th .v-selection-control__wrapper {
  display: none;
}
</style>
