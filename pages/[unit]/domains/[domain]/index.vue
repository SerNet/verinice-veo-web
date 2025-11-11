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
  <BasePage
    :title="`Dashboard: ${domain?.translations?.[locale]?.name || domain?.name}`"
    :loading="!domain"
    data-component-name="domain-dashboard-page"
    padding
  >
    <UtilNotFoundError v-if="domainNotFound" :text="t('domainNotFoundText')" />

    <template v-else>
      <v-skeleton-loader v-if="!domain" data-veo-test="loader" class="mt-n2 mb-4 skeleton-subtitle" type="text" />

      <v-row>
        <template v-if="elementStatusCountIsFetching">
          <v-col v-for="index in 2" :key="index" cols="12" lg="6">
            <BaseWidget v-for="j in 4" :key="j" loading class="my-4">
              <template #skeleton>
                <v-row v-for="k in [1, 2]" :key="k" class="align-center">
                  <v-col cols="12" md="4">
                    <v-skeleton-loader data-veo-test="loader" class="ml-6" type="text" width="70%" />
                  </v-col>
                  <v-col>
                    <v-skeleton-loader data-veo-test="loader" class="ml-6" type="heading" width="210%" />
                  </v-col>
                </v-row>
              </template>
            </BaseWidget>
          </v-col>
        </template>

        <template v-else>
          <v-col v-for="(row, rowIndex) of chartData" :key="rowIndex" cols="12" lg="6">
            <div v-for="widget of row" :key="widget[0]" class="my-4">
              <WidgetMyLatestRevisions
                v-if="widget[0] === 'my_latest_widget'"
                data-component-name="domain-dashboard-latest-revisions-widget"
              />
              <WidgetStackedStatusBarChart
                v-else
                chart-height="30"
                :data="widget[1]"
                :domain-id="route.params.domain as string"
                :object-type="widget[0]"
                :data-component-name="`domain-dashboard-${widget[0]}-widget`"
                :data-veo-test="`domain-dashboard-${widget[0]}-widget`"
                @click="onBarClicked"
              />
            </div>
          </v-col>
        </template>
      </v-row>
    </template>
  </BasePage>
</template>

<script lang="ts">
import { OBJECT_TYPE_SORT_ORDER } from '~/lib/utils';
import { ROUTE_NAME as OBJECT_OVERVIEW_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/index.vue';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { useQuery } from '~/composables/api/utils/query';

export const ROUTE_NAME = 'unit-domains-domain';

export default defineComponent({
  name: 'VeoDomainDashboardPage',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { t, locale } = useI18n();
    const { t: tGlobal } = useI18n({ useScope: 'global' });

    // Domain specific stuff
    const fetchDomainElementStatusCountQueryParameters = computed(() => ({
      id: route.params.domain as string,
      unitId: route.params.unit as string
    }));
    const {
      data: domainObjectInformation,
      isFetching: elementStatusCountIsFetching,
      error: fetchElementStatusCountError
    } = useQuery(
      domainQueryDefinitions.queries.fetchDomainElementStatusCount,
      fetchDomainElementStatusCountQueryParameters
    );

    const fetchDomainQueryParameters = computed(() => ({
      id: route.params.domain as string
    }));

    const domainQueryEnabled = computed(() => !!route.params.domain);

    const { data: domain, error: fetchDomainError } = useQuery(
      domainQueryDefinitions.queries.fetchDomain,
      fetchDomainQueryParameters,
      { enabled: domainQueryEnabled }
    );

    const domainNotFound = computed(
      () => fetchDomainError.value?.code === 404 || fetchElementStatusCountError.value?.code === 404
    );
    // Create chart data
    const chartData = computed(() => {
      const widgets = Object.entries(domainObjectInformation.value || {})
        .filter(([_key, value]) => Object.keys(value).length !== 0)
        .sort(
          ([keyA, _valueA], [keyB, _valueB]) =>
            OBJECT_TYPE_SORT_ORDER.indexOf(keyA) - OBJECT_TYPE_SORT_ORDER.indexOf(keyB)
        );
      widgets.push(['my_latest_widget', {}]);

      const rows = [];
      for (let i = 0; i < widgets.length; i += WIDGETS_PER_ROW) {
        rows.push(widgets.slice(i, i + WIDGETS_PER_ROW));
      }
      return rows;
    });

    const WIDGETS_PER_ROW = 5;

    const onBarClicked = (objectType: string, subType: string, status: string) => {
      router.push({
        name: OBJECT_OVERVIEW_ROUTE,
        params: {
          domain: route.params.domain,
          objectType,
          subType
        },
        query: {
          status
        }
      });
    };

    const fetchUnitQueryParams = computed(() => ({
      id: route.params.unit as string
    }));
    const fetchUnitQueryEnabled = computed(() => !!route.params.unit);

    const { data: unit } = useQuery(unitQueryDefinitions.queries.fetch, fetchUnitQueryParams, {
      enabled: fetchUnitQueryEnabled
    });

    return {
      chartData,
      domain,
      domainNotFound,
      elementStatusCountIsFetching,
      onBarClicked,
      unit,
      locale,
      t,
      tGlobal,
      route
    };
  }
});
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-index.json"></i18n>

<style lang="scss" scoped>
.skeleton-subtitle {
  align-items: center;
  display: flex;
  height: 18.89;
  width: 300px;

  :deep(.v-skeleton-loader__text) {
    height: 16px;
  }
}
</style>
