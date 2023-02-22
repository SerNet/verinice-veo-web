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
  <BaseWidget>
    <template #default>
      <v-row
        v-for="(chart, index) of chartData"
        :key="index"
        class="align-center"
        dense
      >
        <v-col
          cols="12"
          sm="12"
          md="5"
          lg="7"
          xl="4"
          class="body-1 text-no-wrap"
        >
          <nuxt-link
            :to="objectOveriewLink(index)"
            class="text-black text-decoration-none"
          >
            {{ chart.labels[0] }}
          </nuxt-link>
        </v-col>
        <v-col
          cols="12"
          sm="12"
          md="7"
          lg="5"
          xl="8"
        >
          <v-skeleton-loader
            v-if="schemasIsLoading"
            width="100%"
            type="image"
            height="25px"
            class="my-1"
          />
          <Bar
            v-else-if="chart.totalEntries > 0"
            ref="barChartRef"
            :data="chart"
            :options="options[index]"
            :plugins="[ChartDataLabels]"
            :style="{ height: `${chartHeight}px`, cursor: 'pointer', width: '100%', position: 'relative' }"
          />
          <div
            v-else
            class="ml-2 font-italic text-body-2"
          >
            {{ t('noObjects') }}
          </div>
        </v-col>
      </v-row>
      <div
        v-if="chartData.length === 0"
        class="ml-6 font-italic text-body-2"
      >
        {{ t('noSubtypes') }}
      </div>
    </template>
  </BaseWidget>
</template>

<script lang="ts">
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, BarController, Tooltip, CategoryScale, BarElement, LinearScale, ChartOptions } from 'chart.js';
import { upperFirst } from 'lodash';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { IVeoDomainStatusCount } from '~/plugins/api/domain';
import { CHART_COLORS } from '~/lib/utils';
import { useFetchForms } from '~/composables/api/forms';
import { useFetchTranslations } from '~/composables/api/translations';
import { useFetchSchema } from '~/composables/api/schemas';
import { PropType } from 'vue';

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

export interface IChartValue {
  totalEntries: number;
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string;
    label: string;
  }[];
}

export default defineComponent({
  components: {
    Bar
  },
  props: {
    data: {
      type: Object as PropType<IVeoDomainStatusCount['x']>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {}
    },
    chartHeight: {
      type: [Number, String],
      default: 50
    },
    objectType: {
      type: String,
      required: true
    },
    domainId: {
      type: String,
      required: true
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const { locale, t } = useI18n();
    const route = useRoute();

    const barChartRef = ref([]);

    const fetchSchemaQueryParameters = computed(() => ({ domainIds: [props.domainId], type: props.objectType }));
    const fetchSchemaQueryEnabled = computed(() => !!props.domainId);
    const { data: objectSchema, isFetching: schemasIsLoading } = useFetchSchema(fetchSchemaQueryParameters, { enabled: fetchSchemaQueryEnabled });

    const sortedStatusBySubType = computed<Record<string, any>>(() =>
      (objectSchema.value?.properties?.domains?.properties?.[props.domainId]?.allOf || []).reduce((previousValue, currentValue) => {
        previousValue[currentValue.if.properties.subType.const] = currentValue.then.properties.status.enum;
        return previousValue;
      }, Object.assign({}))
    );

    const translationQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations } = useFetchTranslations(translationQueryParameters);

    const formsQueryParameters = computed(() => ({ domainId: props.domainId }));
    const formsQueryEnabled = computed(() => !!props.domainId);
    const { data: formSchemas } = useFetchForms(formsQueryParameters, { enabled: formsQueryEnabled });

    const sortedSubTypes = computed(() =>
      Object.entries(props.data).sort(
        ([subTypeA, _subTypeDataA], [subTypeB, _subTypeDataB]) =>
          (formSchemas.value || []).findIndex((formSchema) => formSchema.subType === subTypeA) -
          (formSchemas.value || []).findIndex((formSchema) => formSchema.subType === subTypeB)
      )
    );

    const options = computed<ChartOptions[]>(() =>
      sortedSubTypes.value.map(([_subType, subTypeData], index) => ({
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_point: any, $event: any) => handleClickEvent(index, $event),
        plugins: {
          datalabels: {
            anchor: 'start' as 'start' | 'center' | 'end',
            align: 'end' as 'start' | 'center' | 'end',
            clip: true,
            color: 'white',
            display(context: any) {
              const index = context.dataIndex;
              const value = context.dataset?.data?.[index] || -1;
              return value > 0;
            }
          },
          tooltip: {
            enabled: false
          }
        },
        indexAxis: 'y' as 'x' | 'y',
        barPercentage: 1,
        categoryPercentage: 1,
        offset: false,
        scales: {
          x: {
            min: 0,
            max: Object.values(subTypeData).reduce((previousValue, currentValue) => previousValue + currentValue, 0),
            stacked: true,
            ticks: {
              display: false
            },
            grid: {
              display: false
            }
          },
          y: {
            min: 1,
            max: 1,
            stacked: true,
            ticks: {
              display: false
            },
            grid: {
              display: false
            }
          }
        }
      }))
    );

    const handleClickEvent = (clickedBarIndex: number, event: any) => {
      const subType = sortedSubTypes.value[clickedBarIndex][0];
      emit('click', props.objectType, subType, sortedStatusBySubType.value[subType][event[0].datasetIndex]);
    };

    const chartData = computed<IChartValue[]>(() =>
      sortedSubTypes.value.map(([subType, subTypeData]) => ({
        totalEntries: Object.values(subTypeData).reduce((previosValue, currentValue) => previosValue + currentValue, 0),
        labels: [(formSchemas.value || []).find((formSchema) => formSchema.subType === subType)?.name?.[locale.value] || subType],
        datasets: (Object.entries(sortedStatusBySubType.value).find(([sortedStatusSubType, _status]) => sortedStatusSubType === subType)?.[1] || []).map(
          (status: string, index: number) => ({
            data: [subTypeData[status]],
            backgroundColor: CHART_COLORS[index],
            label: translations.value?.lang[locale.value][`${props.objectType}_${subType}_status_${status}`] || status
          })
        )
      }))
    );

    const objectOveriewLink = (subTypeIndex: number) =>
      `/${route.params.unit}/domains/${route.params.domain}/objects?objectType=${props.objectType}&subType=${sortedSubTypes.value[subTypeIndex][0]}`;

    return {
      barChartRef,
      chartData,
      ChartDataLabels,
      objectOveriewLink,
      options,
      schemasIsLoading,

      upperFirst,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "noObjects": "No objects available",
    "noSubtypes": "There are no subtypes for this object type"
  },
  "de": {
    "noObjects": "Keine Objekte vorhanden",
    "noSubtypes": "Für diesen Objekttyp existieren keine Subtypen"
  }
}
</i18n>
