<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Jessica Lühnen, Samuel Vitzthum
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
    :loading="!domain"
    padding
    fullsize
  >
    <p
      v-if="domain"
      class="veo-domain-description"
    >
      <span v-if="domain.description">{{ domain.description }}</span>
      <i v-else>{{ t('unit.details.nodescription') }}</i>
    </p>
    <v-row
      no-gutters
      class="mb-4"
    >
      <v-col
        v-for="objectStatusInformation of chartData"
        :key="objectStatusInformation.objectType"
        cols="12"
        lg="6"
        class="my-4 px-2"
        :data-cy="objectStatusInformation.objectType !== 'my_latest_widget' ? $utils.prefixCyData($options, 'status-bar-chart-widget', $route) : ''"
      >
        <VeoMyLatestRevisionsWidget
          v-if="objectStatusInformation.objectType === 'my_latest_widget'"
        />
        <VeoStackedStatusBarChartWidget
          v-else
          chart-height="30"
          :data="objectStatusInformation.subTypes"
          :loading="$fetchState.pending"
          @click="onBarClick"
        />
      </v-col>
    </v-row>
    <VeoWelcomeDialog
      v-if="welcomeDialog"
      v-model="welcomeDialog"
    />
  </VeoPage>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, useContext, useFetch, useMeta, useRouter, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { IVeoDomain, IVeoFormSchemaMeta, IVeoObjectSchema, IVeoTranslations } from '~/types/VeoTypes';
import LocalStorage from '~/util/LocalStorage';
import { IChartValue } from '~/components/widgets/VeoStackedStatusBarChartWidget.vue';
import { IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { useVeoAlerts } from '~/composables/VeoAlert';

export default defineComponent({
  setup(_props) {
    const { t, locale } = useI18n();
    const { $api, params } = useContext();
    const router = useRouter();
    const { displayErrorMessage } = useVeoAlerts();

    const domainId = computed(() => separateUUIDParam(params.value.domain).id);
    const welcomeDialog = ref(!LocalStorage.firstStepsCompleted);

    // refetch everything if domain changes
    watch(
      () => params.value.domain,
      () => {
        fetch();
      }
    );

    const { fetch } = useFetch(async () => {
      await fetchTranslations();
      await fetchDomain();
      await fetchFormschemaMetaInfo();
      await fetchAllStatusTypes();
      await loadEntitiesPerStatus();
    });

    // Fetch the current domain for use in later calls
    const domain: Ref<IVeoDomain | undefined> = ref();
    async function fetchDomain() {
      try {
        domain.value = await $api.domain.fetch(domainId.value);
      } catch (e: any) {
        if (e.code === 404) {
          displayErrorMessage(t('error404').toString(), t('domainNotFoundText').toString());
          router.push(`/${params.value.unit}`);
        }
      }
    }

    let translations: IVeoTranslations = { lang: {} };
    async function fetchTranslations() {
      // Only load the translations once, as they won't change if the domain changes
      if (JSON.stringify(translations.lang) === '{}') {
        translations = await $api.translation.fetch(['de', 'en']);
      }
    }

    // Load all formschemas to use their translated names instead of the subtype keys when displaying the bars
    let formschemas: IVeoFormSchemaMeta[] = [];
    async function fetchFormschemaMetaInfo() {
      if (domain.value) {
        formschemas = await $api.form.fetchAll(domain.value.id);
      }
    }

    // Extract subtypes and status from schemas
    function extractAllSubtypeStatusFromSchema(schema: IVeoObjectSchema): { subType: string; status: string[] }[] {
      return (
        Object.values(schema.properties.domains.properties)[0].allOf?.map((mapping) => ({
          subType: mapping.if.properties.subType.const,
          status: mapping.then.properties.status.enum
        })) || []
      );
    }

    // Create chart data
    const CHART_COLORS = ['#c90000', '#ffc107', '#3f51b5', '#8bc34a', '#858585'];
    const chartData: Ref<{ objectType: string; subTypes: { subType: string; title: string; totalEntities: number; statusTypes: (IChartValue & { status: string })[] }[] }[]> = ref(
      []
    );
    const WIDGET_ORDER = ['scope', 'incident', 'process', 'document', 'asset', 'scenario', 'person', 'my_latest_widget', 'control'];
    let schemaTypes: IVeoSchemaEndpoint[] = [];

    async function fetchAllStatusTypes() {
      // As schema types don't change if the domain changes, we don't have to reload them after they get initially loaded
      if (schemaTypes.length === 0) {
        schemaTypes = await $api.schema.fetchAll();
      }

      // Load all schemas and extract their subtypes and for the subtypes their possible status
      for (const type of schemaTypes) {
        const schema = await $api.schema.fetch(type.schemaName, [domainId.value]);

        chartData.value.push({
          objectType: type.schemaName,
          subTypes: extractAllSubtypeStatusFromSchema(schema)
            .map((subtype) => {
              let currentColorIndex = 0;

              return {
                subType: subtype.subType,
                title: formschemas.find((formschema) => formschema.subType === subtype.subType)?.name[locale.value] || subtype.subType,
                statusTypes: subtype.status.map((status: string) => ({
                  status,
                  label: translations.lang && translations.lang[locale.value] ? translations.lang[locale.value][`${type.schemaName}_${subtype.subType}_status_${status}`] : status,
                  value: 0,
                  color: CHART_COLORS[currentColorIndex++ % CHART_COLORS.length]
                })),
                totalEntities: 0
              };
            })
            .sort((a, b) => {
              const sortValueA = formschemas.find((schema) => schema.subType === a.subType)?.sorting;
              const sortValueB = formschemas.find((schema) => schema.subType === b.subType)?.sorting;

              if (!sortValueA) {
                return 1;
              }
              if (!sortValueB) {
                return 0;
              }

              return sortValueA.localeCompare(sortValueB);
            })
        });
      }

      // Add my latest widget, so it gets included in the sorting
      chartData.value.push({ objectType: 'my_latest_widget', subTypes: [] });

      // Sort by order defined in WIDGET_ORDER
      chartData.value.sort((a, b) => WIDGET_ORDER.findIndex((widgetTitle) => widgetTitle === a.objectType) - WIDGET_ORDER.findIndex((widgetTitle) => widgetTitle === b.objectType));
    }

    // As there is no introspection endpoint, we have to fetch all entities of a type with a very high items per page count and count them manually
    async function loadEntitiesPerStatus() {
      if (domain.value) {
        for (const schemaType of schemaTypes) {
          const allEntitiesPerType = await $api.entity.fetchAll(schemaType.schemaName, 1, { size: Number.MAX_VALUE });
          const chartDataType = chartData.value.find((type) => type.objectType === schemaType.schemaName);
          for (const subType of chartDataType?.subTypes || []) {
            for (const status of subType.statusTypes) {
              status.value = allEntitiesPerType.items.filter((entity) => {
                return (
                  entity.domains[(domain.value as any as IVeoDomain).id]?.subType === subType.subType &&
                  entity.domains[(domain.value as any as IVeoDomain).id]?.status === status.status
                );
              }).length;
            }
            subType.totalEntities = subType.statusTypes.reduce((previousValue, currentValue) => previousValue + currentValue.value, 0);
          }
        }
      }
    }

    // Navigate if the user clicks on a bar
    function onBarClick(subType: string, status: string) {
      const formId = formschemas.find((formschema) => formschema.subType === subType)?.id;

      if (formId) {
        router.push({
          name: 'unit-domains-domain-forms-form',
          params: {
            domnain: params.value.domain,
            form: createUUIDUrlParam('form', formId)
          },
          query: {
            status
          }
        });
      }
    }

    // page title
    const title = computed(() => domain.value?.name || t('domainOverview').toString());
    useMeta(() => ({
      title: title.value
    }));

    return {
      chartData,
      domain,
      onBarClick,
      title,
      welcomeDialog,

      t
    };
  },
  head: {}
});
</script>

<i18n>
{
  "en": {
    "domainNotFoundText": "The requested domain couldn't be found. You have been returned to the unit dashboard.",
    "domainOverview": "Module overview"
  },
  "de": {
    "domainNotFoundText": "Die gewünschte Domain konnte nicht gefunden werden. Sie wurden zum Unit Dashboard zurückgebracht.",
    "domainOverview": "Modulübersicht"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-domain-description {
  color: $accent;
  margin-top: -20px;
}
</style>
