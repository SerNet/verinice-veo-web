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
  <canvas
    :id="`stacked-bar-chart-${uid}`"
    ref="chart"
    :height="height"
    :width="width"
  />
</template>

<script lang="ts">
import { watch } from 'fs';
import { defineComponent, getCurrentInstance, onMounted, PropOptions, ref } from '@nuxtjs/composition-api';
import { Chart, registerables } from 'chart.js';

export default defineComponent({
  props: {
    height: {
      type: Number,
      default: 400
    },
    width: {
      type: Number,
      default: 400
    },
    data: {
      type: Array as PropOptions<number[]>,
      default: () => []
    }
  },
  setup(props) {
    const vm = getCurrentInstance();
    const uid = ref(vm?.uid);

    Chart.register(...registerables);
    const chart = ref(null);
    const chartInstance = ref(undefined);
    watch(
      () => props.data,
      () => {
        if (chart.value) {
          chart.value.update();
        }
      }
    );
    onMounted(() => {
      chartInstance.value = new Chart(chart.value, {
        type: 'bar',
        data: props.data,
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true
            }
          }
        }
      });
    });

    return {
      uid,
      chart
    };
  }
});
</script>
