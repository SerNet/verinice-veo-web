<!--
   - verinice.veo web
   - Copyright (C) 2024 Aziz Khalledi
   -
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <v-container class="pt-0">
    <div class="d-flex align-center">
      <v-card-subtitle class="pr-0 px-0">{{ t('riskMatrix') }} </v-card-subtitle>
      <v-btn :icon="mdiPencil" variant="plain" size="small" class="d-none" />
    </div>

    <v-card-text class="pt-0 overflow-x-auto">
      <div class="table-container">
        <v-table density="compact">
          <thead>
            <tr>
              <th :style="{ border: 'none' }"></th>
              <th :style="{ border: 'none' }"></th>

              <th>
                <div class="probability-title">
                  {{ upperFirst(t('probability').toString()) }}
                </div>
              </th>
            </tr>

            <tr>
              <th :style="{ border: 'none' }"></th>
              <th :style="{ border: 'none' }"></th>
              <v-tooltip
                v-for="probability in probabilities"
                :key="probability.ordinalValue"
                max-width="400px"
                top
                :text="getProbabilityTooltipText(probability)"
              >
                <template #activator="{ props }">
                  <th
                    v-bind="props"
                    :style="{
                      flex: 1,
                      height: '100%',
                      width: 'auto',
                      textAlign: 'center',
                      border: '0.01em solid white',
                      backgroundColor: probability.htmlColor,
                      color: getMostContrastyColor(probability.htmlColor)
                    }"
                  >
                    <div>
                      {{ getProbabilityName(probability) }}
                    </div>
                  </th>
                </template>
              </v-tooltip>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th :style="{ border: 'none' }" :rowspan="impactRows.length + 1" class="impact-title-cell">
                <div class="impact-title">
                  {{ upperFirst(t('impact').toString()) }}
                </div>
              </th>
            </tr>
            <tr
              v-for="(_row, rowIndex) in reversedValue"
              :key="rowIndex"
              :style="{
                height: '100%',
                width: 'auto',
                textAlign: 'center'
              }"
            >
              <v-tooltip max-width="400px" top :text="getImpactTooltipText(rowIndex)">
                <template #activator="{ props }">
                  <td
                    v-bind="props"
                    :style="{
                      height: '100%',
                      width: 'auto',
                      border: '0.01em solid white',
                      backgroundColor: reversedImpacts[rowIndex].htmlColor,
                      color: getMostContrastyColor(reversedImpacts[rowIndex].htmlColor)
                    }"
                  >
                    <div>
                      {{ getImpactName(rowIndex) }}
                    </div>
                  </td>
                </template>
              </v-tooltip>
              <v-tooltip
                v-for="(cell, cellIndex) in getImpactValues(rowIndex)"
                :key="cellIndex"
                max-width="400px"
                top
                :text="getCellTooltipText(cell)"
              >
                <template #activator="{ props }">
                  <td
                    v-bind="props"
                    :style="{
                      border: '0.01em solid white'
                    }"
                    class="text-center px-0 py-0"
                  >
                    <div
                      :style="{
                        backgroundColor: riskValues[cell.ordinalValue].htmlColor,
                        color: getMostContrastyColor(cell.htmlColor),
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        flex: 1
                      }"
                    >
                      {{ getCellName(cell) }}
                    </div>
                  </td>
                </template>
              </v-tooltip>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card-text>
  </v-container>
</template>

<script setup lang="ts">
import { mdiPencil } from '@mdi/js';
import { cloneDeep, reverse, upperFirst } from 'lodash';
import { defineProps } from 'vue';
import type { IVeoRiskPotentialImpact, IVeoRiskProbabilityLevel, IVeoRiskValueLevel } from '~/types/VeoTypes';
const props = defineProps({
  probabilities: {
    type: Array as PropType<IVeoRiskProbabilityLevel[]>,
    required: true
  },
  value: {
    type: Array as PropType<IVeoRiskValueLevel[][]>,
    required: true
  },
  impacts: {
    type: Array as PropType<IVeoRiskPotentialImpact[]>,
    default: () => []
  },
  riskValues: {
    type: Array as PropType<IVeoRiskValueLevel[]>,
    default: () => []
  },
  getMostContrastyColor: {
    type: Function,
    required: true
  }
});

const { t, locale } = useI18n();

const getImpactValues = (rowIndex: number) => {
  return reversedValue.value[rowIndex];
};

const impactRows = ref(['vernachlässigbar', 'begrenzt', 'beträchtlich', 'existenzbedrohend']);

/**
 * Values are reversed to correctly render the matrix:
 * severity levels should increase from bottom to top
 */
const reversedValue = computed(() => reverse(cloneDeep(props.value)));
const reversedImpacts = computed(() => reverse(cloneDeep(props.impacts)));

// Probability levels
const getProbabilityTooltipText = (probability: IVeoRiskProbabilityLevel) =>
  translate(probability.translations)['description'];
const getProbabilityName = (probability: IVeoRiskProbabilityLevel) => translate(probability.translations)['name'];

// Impacts
const getImpactTooltipText = (rowIndex: number) =>
  translate(reversedImpacts.value[rowIndex].translations)['description'];
const getImpactName = (rowIndex: number) => translate(reversedImpacts.value[rowIndex].translations)['name'];

// Risk values
const getCellTranslation = (cell: IVeoRiskValueLevel, key: 'description' | 'name') => {
  const matchingRiskValue = props.riskValues.find((value) => value.ordinalValue === cell.ordinalValue);
  return translate(matchingRiskValue.translations)[key];
};

const getCellTooltipText = (cell: IVeoRiskValueLevel) => getCellTranslation(cell, 'description');
const getCellName = (cell: IVeoRiskValueLevel) => getCellTranslation(cell, 'name');

function translate<T>(translations: { [lang: string]: T }): T {
  return translations[locale.value] || Object.values(translations)[0];
}
</script>

<i18n>
  {
    "en": {
      "impact": "impact",
      "noData": "no data",
      "probability": "probability",
      "riskMatrix": "Risk matrix:",
    },
    "de": {
      "impact": "auswirkung",
      "noData": "keine Daten",
      "probability": "eintrittswahrscheinlichkeit",
      "riskMatrix": "Risikomatrix:",
    }
  }
</i18n>

<style scoped>
.table-container {
  position: relative;
  display: inline-block;
}

.impact-title {
  position: absolute;
  top: 80%;
  left: 3%;
  transform: rotate(-90deg);
  transform-origin: left center;
  font-size: 1.2em;
  font-weight: bold;
}

.probability-title {
  position: absolute;
  top: 5%;
  left: 70%;
  transform: translateX(-50%);
  font-size: 1.2em;
  font-weight: bold;
}

.impact-title-cell {
  padding: 0;
  border: none;
}
</style>
