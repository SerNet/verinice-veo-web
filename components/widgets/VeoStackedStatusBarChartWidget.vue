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
  <VeoWidget :title="upperFirst(title)">
    <template #default>
      <v-row
        v-for="(chart, index) of chartData"
        :key="index"
        class="align-center"
      >
        <v-col
          cols="12"
          md="4"
          lg="2"
        >
          <h4>{{ chart.name }}</h4>
        </v-col>
        <v-col>
          <BarChart
            ref="barChartRef"
            :chart-data="chart.data"
            :options="options[index]"
            :style="{ height: `${chartHeight}px` }"
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
    data: {
      type: Array as PropType<{ name: string; data: IChartValue[] }[]>,
      default: () => []
    },
    chartHeight: {
      type: [Number, String],
      default: 50
    }
  },
  setup(props) {
    const barChartRef = ref([]);

    const options: ComputedRef<any[]> = computed(() =>
      props.data.map((entry) => ({
        responsive: true,
        plugins: {
          legend: false,
          title: {
            display: true,
            text: 'Chart.js Doughnut Chart',
            align: 'start'
          }
        },
        indexAxis: 'y',
        barPercentage: 1,
        categoryPercentage: 1,
        offset: false,
        scales: {
          x: {
            min: 1,
            max: entry.data.reduce((previousValue, currentValue) => previousValue + currentValue.value, 0),
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

    const chartData: ComputedRef<any[]> = computed(() =>
      props.data.map((entry) => ({
        labels: [entry.name],
        datasets: entry.data.map((value) => ({
          data: [value.value],
          backgroundColor: value.color,
          label: value.label
        }))
      }))
    );
    console.log(chartData);

    return {
      barChartRef,
      chartData,
      options,

      upperFirst
    };
  }
});
</script>
