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
  <table class="my-2">
    <thead>
      <tr>
        <th :colspan="probabilities.length + 2" class="py-1" style="height: auto">
          {{ upperFirst(t('probability').toString()) }}
        </th>
      </tr>
      <tr>
        <td colspan="2" />
        <th
          v-for="probability of probabilities"
          :key="probability.ordinalValue"
          scope="col"
          class="px-4 py-2"
          :style="{
            backgroundColor: probability.htmlColor,
            color: getMostContrastyColor(probability.htmlColor)
          }"
        >
          <div class="d-flex flex-wrap justify-center">
            <span
              >{{
                (probability.translations[locale] && probability.translations[locale].name) ||
                Object.values(probability.translations)[0].name
              }}&nbsp;</span
            >
            <v-tooltip max-width="400px" top>
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  :color="getMostContrastyColor(probability.htmlColor)"
                  end
                  :icon="mdiInformationOutline"
                />
              </template>
              <template #default>
                {{
                  (probability.translations[locale] && probability.translations[locale].description) ||
                  Object.values(probability.translations)[0].description
                }}
              </template>
            </v-tooltip>
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th
          :rowspan="impacts.length + 1"
          class="px-2"
          style="text-orientation: upright; writing-mode: tb; width: auto; min-width: 44px"
        >
          {{ upperFirst(t('impact').toString()) }}
        </th>
      </tr>
      <tr v-for="(impact, rowIndex) of impacts" :key="impact.ordinalValue">
        <th
          scope="row"
          class="px-4 py-2"
          :style="{
            backgroundColor: impact.htmlColor,
            color: getMostContrastyColor(impact.htmlColor)
          }"
        >
          <div class="d-flex flex-wrap justify-center">
            <span
              >{{
                (impact.translations[locale] && impact.translations[locale].name) ||
                Object.values(impact.translations)[0].name
              }}&nbsp;</span
            >
            <v-tooltip max-width="400px" top>
              <template #activator="{ props }">
                <v-icon v-bind="props" :color="getMostContrastyColor(impact.htmlColor)" :icon="mdiInformationOutline" />
              </template>
              <template #default>
                {{
                  (impact.translations[locale] && impact.translations[locale].description) ||
                  Object.values(impact.translations)[0].description
                }}
              </template>
            </v-tooltip>
          </div>
        </th>
        <template v-if="value[rowIndex]">
          <td
            v-for="(_value, colIndex) of value[rowIndex]"
            :key="colIndex"
            class="px-4 py-2"
            :style="{
              backgroundColor: _value.htmlColor,
              color: getMostContrastyColor(_value.htmlColor)
            }"
          >
            <div class="d-flex flex-wrap justify-center">
              <span
                >{{
                  (riskValues[_value.ordinalValue].translations[locale] &&
                    riskValues[_value.ordinalValue].translations[locale].name) ||
                  Object.values(riskValues[_value.ordinalValue].translations)[0].name
                }}&nbsp;</span
              >
              <v-tooltip max-width="400px" top>
                <template #activator="{ props }">
                  <v-icon
                    v-bind="props"
                    :color="getMostContrastyColor(_value.htmlColor)"
                    :icon="mdiInformationOutline"
                  />
                </template>
                <template #default>
                  {{
                    (riskValues[_value.ordinalValue].translations[locale] &&
                      riskValues[_value.ordinalValue].translations[locale].description) ||
                    Object.values(riskValues[_value.ordinalValue].translations)[0].description
                  }}
                </template>
              </v-tooltip>
            </div>
          </td>
          <td
            v-for="index in impacts.length - value[rowIndex].length"
            :key="index + value[rowIndex].length"
            class="px-4 py-2"
          >
            {{ upperFirst(t('noData').toString()) }}
          </td>
        </template>
        <td v-else :colspan="impacts.length" class="px-4 py-2">
          {{ upperFirst(t('noData').toString()) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { mdiInformationOutline } from '@mdi/js';
import { upperFirst } from 'lodash';

import { IVeoRiskProbabilityLevel, IVeoRiskValueLevel, IVeoRiskPotentialImpact } from '~/types/VeoTypes';

export default defineComponent({
  inheritAttrs: false,
  props: {
    value: {
      type: Array as PropType<IVeoRiskValueLevel[][]>,
      default: () => []
    },
    probabilities: {
      type: Array as PropType<IVeoRiskProbabilityLevel[]>,
      default: () => []
    },
    impacts: {
      type: Array as PropType<IVeoRiskPotentialImpact[]>,
      default: () => []
    },
    riskValues: {
      type: Array as PropType<IVeoRiskValueLevel[]>,
      default: () => []
    }
  },
  setup() {
    const { t, locale } = useI18n();

    const CONTRAST_THRESHOLD = 90;

    const getMostContrastyColor = (backgroundColor: string) => {
      const hex = backgroundColor.substring(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      return r * 0.299 + g * 0.587 + b * 0.114 > CONTRAST_THRESHOLD ? '#000000' : '#ffffff';
    };

    return {
      getMostContrastyColor,

      mdiInformationOutline,
      upperFirst,
      t,
      locale
    };
  }
});
</script>

<i18n>
{
  "en": {
    "impact": "impact",
    "noData": "no data",
    "probability": "probability"
  },
  "de": {
    "impact": "auswirkung",
    "noData": "keine Daten",
    "probability": "eintrittswahrscheinlichkeit"
  }
}
</i18n>

<style lang="scss" scoped>
td,
th {
  font-weight: normal;
  height: 100px;
  text-align: center;
  width: 100px;
}
</style>
