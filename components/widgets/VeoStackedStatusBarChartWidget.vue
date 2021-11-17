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
  <VeoWidget
    :title="upperFirst(title)"
    :loading="loading"
  >
    <template #default>
      <v-row
        v-for="(chart, index) of chartData"
        :key="index"
        class="align-center"
        :data-cy="$utils.prefixCyData($options, 'subtype-row', $route)"
      >
        <v-col
          cols="12"
          md="4"
        >
          <h4 class="ml-6">{{ chart.labels[0] }}</h4>
        </v-col>
        <v-col>
          <BarChart
            v-if="chart.totalEntities > 0"
            ref="barChartRef"
            :chart-data="chart"
            :options="options[index]"
            :style="{ height: `${chartHeight}px`, cursor: 'pointer' }"
          />
          <div
            v-else
            class="ml-2 font-italic"
          >
            {{ t('noObjects') }}
          </div>
        </v-col>
      </v-row>
      <div
        v-if="chartData.length === 0"
        class="ml-6 font-italic"
      >
        {{ t('noSubtypes') }}
      </div>
    </template>
    <template #skeleton>
      <v-row
        v-for="index in [1,2]"
        :key="index"
        class="align-center"
      >
        <v-col
          cols="12"
          md="4"
        >
          <v-skeleton-loader
            class="ml-6 my-2"
            type="text"
            width="70%"
          />
        </v-col>
        <v-col>
          <v-skeleton-loader
            class="ml-6 my-2"
            type="heading"
            width="210%"
          />
        </v-col>
      </v-row>      
    </template>
  </VeoWidget>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, PropType, ref } from '@nuxtjs/composition-api';
import { BarChart } from 'vue-chart-3';
import { Chart, BarController, Tooltip, CategoryScale, BarElement, LinearScale } from 'chart.js';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

export interface IChartValue {
  label: string;
  value: number;
  color: string;
}

export default defineComponent({
  components: {
    BarChart
  },
  props: {
    title: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array as PropType<{ subType: string; title: string; statusTypes: (IChartValue & { status: string })[]; totalEntities: number }[]>,
      default: () => []
    },
    chartHeight: {
      type: [Number, String],
      default: 50
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const barChartRef = ref([]);

    const options: ComputedRef<any[]> = computed(() =>
      props.data.map((entry, index) => ({
        responsive: true,
        onClick: (_point: any, $event: any) => handleClickEvent(index, $event),
        plugins: {
          legend: false
        },
        indexAxis: 'y',
        barPercentage: 1,
        categoryPercentage: 1,
        offset: false,
        scales: {
          x: {
            min: 0,
            max: entry.statusTypes.reduce((previousValue, currentValue) => previousValue + currentValue.value, 0),
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

    function handleClickEvent(clickedBarIndex: number, event: any) {
      emit('click', props.data[clickedBarIndex].subType, props.data[clickedBarIndex].statusTypes[event[0].datasetIndex].status);
    }

    const chartData: ComputedRef<any[]> = computed(() =>
      props.data.map((entry) => ({
        totalEntities: entry.totalEntities,
        labels: [entry.title],
        datasets: entry.statusTypes.map((value) => ({
          data: [value.value],
          backgroundColor: value.color,
          label: value.label
        }))
      }))
    );

    return {
      barChartRef,
      chartData,
      options,

      upperFirst,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "noObjects": "There are no objects for this subtype",
    "noSubtypes": "There are no subtypes for this object type"
  },
  "de": {
    "noObjects": "Für diesen Subtyp existieren keine Objekte",
    "noSubtypes": "Für diesen Objekttyp existieren keine Subtypen"
  }
}
</i18n>