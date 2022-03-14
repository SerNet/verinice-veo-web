<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <table>
    <thead>
      <td class="text-center font-weight-bold">
        {{ upperFirst(t('riskMatrix').toString()) }}
      </td>
      <th
        v-for="_value of riskValues"
        :key="_value.ordinalValue"
        scope="col"
        class="px-4 py-2"
        :style="{ backgroundColor: _value.htmlColor, color: getMostContrastyColor(_value.htmlColor) }"
      >
        {{ _value.name }}
        <v-tooltip
          max-width="400px"
          top
        >
          <template #activator="{ on }">
            <v-icon
              :color="getMostContrastyColor(_value.htmlColor)"
              right
              v-on="on"
            >
              {{ mdiHelpCircle }}
            </v-icon>
          </template>
          <template #default>
            {{ _value.description }}
          </template>
        </v-tooltip>
      </th>
    </thead>
    <tbody>
      <tr
        v-for="(probability, rowIndex) of probabilities"
        :key="probability.ordinalValue"
      >
        <th
          scope="row"
          class="px-4 py-2"
          :style="{ backgroundColor: probability.htmlColor, color: getMostContrastyColor(probability.htmlColor) }"
        >
          {{ probability.name }}<v-tooltip
            max-width="400px"
            top
          >
            <template #activator="{ on }">
              <v-icon
                :color="getMostContrastyColor(probability.htmlColor)"
                right
                v-on="on"
              >
                {{ mdiHelpCircle }}
              </v-icon>
            </template>
            <template #default>
              {{ probability.description }}
            </template>
          </v-tooltip>
        </th>
        <template v-if="value[rowIndex]">
          <td
            v-for="(_value, colIndex) of value[rowIndex]"
            :key="colIndex"
            class="px-4 py-2"
            :style="{ backgroundColor: _value.htmlColor, color: getMostContrastyColor(_value.htmlColor) }"
          >
            {{ _value.name }}
          </td>
          <td
            v-for="index in riskValues.length - value[rowIndex].length"
            :key="index + value[rowIndex].length"
            class="px-4 py-2"
          >
            {{ upperFirst(t('noData').toString()) }}
          </td>
        </template>
        <td
          v-else
          :colspan="riskValues.length"
          class="px-4 py-2"
        >
          {{ upperFirst(t('noData').toString()) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiHelpCircle } from '@mdi/js';
import { upperFirst } from 'lodash';

import { IVeoRiskProbabilityLevel, IVeoRiskValue } from '~/types/VeoTypes';

export default defineComponent({
  inheritAttrs: false,
  props: {
    value: {
      type: Array as PropType<IVeoRiskValue[][]>,
      default: () => []
    },
    probabilities: {
      type: Array as PropType<IVeoRiskProbabilityLevel[]>,
      default: () => []
    },
    riskValues: {
      type: Array as PropType<IVeoRiskValue[]>,
      default: () => []
    }
  },
  setup() {
    const { t } = useI18n();

    const getMostContrastyColor = (backgroundColor: string) => {
      const hex = backgroundColor.substring(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      return r * 0.299 + g * 0.587 + b * 0.114 > 50 ? '#000000' : '#ffffff';
    };

    return {
      getMostContrastyColor,

      mdiHelpCircle,
      upperFirst,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "noData": "no data",
    "riskMatrix": "risk matrix"
  },
  "de": {
    "noData": "keine Daten",
    "riskMatrix": "risikomatrix"
  }
}
</i18n>

<style lang="scss" scoped>
table {
  border-spacing: 0;
}

td {
  height: 150px;
  width: 150px;
}
</style>
