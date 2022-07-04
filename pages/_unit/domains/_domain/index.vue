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
    data-component-name="domain-dashboard-page"
  >
    <div
      v-if="domain"
      class="mt-n2 accent--text text-body-1"
    >
      <span v-if="domain.description">{{ domain.description }}</span>
      <i v-else>{{ t('unit.details.nodescription') }}</i>
    </div>
    <v-skeleton-loader
      v-else
      class="mt-n2 mb-4 skeleton-subtitle"
      type="text"
    />
    <v-row>
      <v-col
        v-for="(row, rowIndex) of chartData"
        :key="rowIndex"
        cols="12"
        lg="6"
      >
        <div
          v-for="widget of row"
          :key="widget[0]"
          v-cy-name="widget[0] !== 'my_latest_widget' ? 'status-bar-chart-widget' : ''"
          class="my-4"
        >
          <VeoMyLatestRevisionsWidget
            v-if="widget[0] === 'my_latest_widget'"
            data-component-name="domain-dashboard-latest-revisions-widget"
          />
          <VeoStackedStatusBarChartWidget
            v-else
            chart-height="30"
            :data="widget[1]"
            :loading="$fetchState.pending"
            :data-component-name="`domain-dashboard-${widget}-widget`"
            @click="onBarClick"
          />
        </div>
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

import { separateUUIDParam } from '~/lib/utils';
import { IVeoDomain, IVeoFormSchemaMeta, IVeoTranslations } from '~/types/VeoTypes';
import LocalStorage from '~/util/LocalStorage';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { IVeoDomainStatusCount } from '~/plugins/api/domain';

export const ROUTE_NAME = 'unit-domains-domain';

export default defineComponent({
  name: 'VeoDomainDashboardPage',
  setup(_props) {
    const { t, locale } = useI18n();
    const { $api, params } = useContext();
    const router = useRouter();
    const { displayErrorMessage } = useVeoAlerts();

    const domainId = computed(() => separateUUIDParam(params.value.domain).id);
    const unitId = computed(() => separateUUIDParam(params.value.unit).id);

    const welcomeDialog = ref(!LocalStorage.firstStepsCompleted);

    // refetch everything if domain changes
    watch(
      () => params.value.domain,
      () => {
        fetch();
      }
    );

    const { fetch } = useFetch(async () => {
      await Promise.all([fetchTranslations(), fetchDomain(), fetchDomainObjectInformation(), fetchFormschemaMetaInfo()]);
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

    const domainObjectInformation = ref<IVeoDomainStatusCount | undefined>();
    const fetchDomainObjectInformation = async () => {
      domainObjectInformation.value = await $api.domain.inspectDomainObjects(unitId.value, domainId.value);
    };

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

    // Create chart data
    const chartData = computed(() => {
      const widgets = Object.entries(domainObjectInformation.value || {}).sort(
        ([keyA, _valueA], [keyB, _valueB]) => WIDGET_LAYOUT.findIndex((widgetName) => widgetName === keyA) - WIDGET_LAYOUT.findIndex((widgetName) => widgetName === keyB)
      );
      widgets.push(['my_latest_widget', {}]);

      const rows = [];
      for (let i = 0; i < widgets.length; i += WIDGETS_PER_ROW) {
        rows.push(widgets.slice(i, i + WIDGETS_PER_ROW));
      }
      return rows;
    });

    const WIDGET_LAYOUT = ['scope', 'process', 'asset', 'person', 'control', 'incident', 'document', 'scenario'];
    const WIDGETS_PER_ROW = 5;

    // Navigate if the user clicks on a bar
    function onBarClick(subType: string, status: string) {
      const objectType = formschemas.find((formschema) => formschema.subType === subType)?.modelType;

      if (objectType) {
        router.push({
          name: 'unit-domains-domain-objects',
          params: {
            domain: params.value.domain
          },
          query: {
            status,
            objectType,
            subType
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
.skeleton-subtitle {
  align-items: center;
  display: flex;
  height: 18.89;
  width: 300px;

  ::v-deep .v-skeleton-loader__text {
    height: 16px;
  }
}
</style>
