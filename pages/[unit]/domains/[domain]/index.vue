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
      <template v-if="$fetchState.pending">
        <v-col
          v-for="index in 2"
          :key="index"
          cols="12"
          lg="6"
        >
          <VeoWidget
            v-for="j in 4"
            :key="j"
            loading
            class="my-4"
          >
            <template #skeleton>
              <v-row
                v-for="k in [1,2]"
                :key="k"
                class="align-center"
              >
                <v-col
                  cols="12"
                  md="4"
                >
                  <v-skeleton-loader
                    class="ml-6"
                    type="text"
                    width="70%"
                  />
                </v-col>
                <v-col>
                  <v-skeleton-loader
                    class="ml-6"
                    type="heading"
                    width="210%"
                  />
                </v-col>
              </v-row>      
            </template>
          </VeoWidget>
        </v-col>
      </template>
      <template v-else>
        <v-col
          v-for="(row, rowIndex) of chartData"
          :key="rowIndex"
          cols="12"
          lg="6"
        >
          <div
            v-for="widget of row"
            :key="widget[0]"
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
              :domain-id="(domain && domain.id) || undefined"
              :object-type="widget[0]"
              :data-component-name="`domain-dashboard-${widget[0]}-widget`"
              @click="onBarClicked"
            />
          </div>
        </v-col>
      </template>
    </v-row>
    <VeoWelcomeDialog
      v-if="welcomeDialog"
      v-model="welcomeDialog"
    />
  </VeoPage>
</template>

<script lang="ts">
import { separateUUIDParam } from '~/lib/utils';
import LocalStorage from '~/util/LocalStorage';
import { useFetchDomain, useFetchDomainElementStatusCount } from '~/composables/api/domains';

export const ROUTE_NAME = 'unit-domains-domain';

export default defineComponent({
  name: 'VeoDomainDashboardPage',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();

    const unitId = computed(() => separateUUIDParam(route.params.unit as string).id);
    const domainId = computed(() => separateUUIDParam(route.params.domain as string).id);

    const welcomeDialog = ref(!LocalStorage.firstStepsCompleted);

    // Domain specific stuff
    const fetchDomainQueryParameters = computed(() => ({ id: domainId.value }));
    const { data: domain } = useFetchDomain(fetchDomainQueryParameters);

    const fetchDomainElementStatusCountQueryParameters = computed(() => ({ id: domainId.value, unitId: unitId.value }));
    const { data: domainObjectInformation } = useFetchDomainElementStatusCount(fetchDomainElementStatusCountQueryParameters);

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

    const onBarClicked = (objectType: string, subType: string, status: string) => {
      router.push({
        name: 'unit-domains-domain-objects',
        params: {
          domain: route.params.domain
        },
        query: {
          objectType,
          subType,
          status
        }
      });
    };

    // page title
    const title = computed(() => domain.value?.name || t('domainOverview').toString());

    return {
      chartData,
      domain,
      onBarClicked,
      title,
      welcomeDialog,

      t
    };
  }
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
