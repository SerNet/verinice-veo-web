<!--
   - verinice.veo web
   - Copyright (C) 2025 jae
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
  <v-card-text class="pd-0 overflow-x-auto">
    <div class="table-container">
      <v-table class="veo-risk-matrix" density="compact">
        <thead>
          <tr>
            <th class="no-borders"></th>
            <th class="no-borders"></th>

            <th class="title-cell no-borders">
              <div class="probability-title text-capitalize">
                {{ t('probability') }}
              </div>
            </th>
          </tr>

          <tr>
            <th class="no-borders"></th>
            <th class="no-borders"></th>
            <v-tooltip
              v-for="probability in probabilityLevels"
              :key="probability.ordinalValue"
              max-width="400px"
              top
              :text="probability?.translations?.[locale]?.description"
              :disabled="isEditMode"
            >
              <template #activator="{ props }">
                <th
                  v-bind="props"
                  :style="{
                    flex: 1,
                    height: '100%',
                    padding: '12px',
                    textAlign: 'center',
                    border: 'var(--veo-risk-matrix-border)',
                    backgroundColor: probability?.htmlColor,
                    width: `${100 / (probabilityLevels.length + 1)}%`,
                    color: getMostContrastyColor(probability?.htmlColor)
                  }"
                >
                  <div>
                    {{ probability?.translations?.[locale]?.name }}
                  </div>
                </th>
              </template>
            </v-tooltip>
          </tr>
        </thead>
        <tbody class="flex-container">
          <tr>
            <th :style="{ border: 'none' }" :rowspan="valueMatrix.length + 1" class="title-cell">
              <div class="impact-title text-capitalize">
                {{ t('impact') }}
              </div>
            </th>
          </tr>

          <tr
            v-for="(_row, rowIndex) in valueMatrix"
            :key="rowIndex"
            :style="{
              height: '100%',
              width: `${100 / (probabilityLevels.length + 1)}%`,
              textAlign: 'center'
            }"
          >
            <!-- Matrix rows are displayed in a reversed order: `.at(-1 - rowIndex)` does this -->
            <v-tooltip
              max-width="400px"
              top
              :text="getImpact(rowIndex)?.translations?.[locale]?.description || t('noDescription')"
              :disabled="isEditMode"
            >
              <template #activator="{ props }">
                <td
                  v-bind="props"
                  :style="{
                    height: '100%',
                    padding: '12px',
                    border: 'var(--veo-risk-matrix-border)',
                    backgroundColor: getImpact(rowIndex)?.htmlColor ?? '#ffffff',
                    width: `${100 / (probabilityLevels.length + 1)}%`,
                    color: getMostContrastyColor(getImpact(rowIndex)?.htmlColor ?? '#fffff')
                  }"
                >
                  <div>
                    {{ getImpact(rowIndex)?.translations?.[locale]?.name ?? t('noValue') }}
                  </div>
                </td>
              </template>
            </v-tooltip>

            <v-tooltip
              v-for="(_cell, cellIndex) in valueMatrix[rowIndex]"
              :key="cellIndex"
              :text="getRiskValue(rowIndex, cellIndex)?.translations?.[locale]?.description || t('noDescription')"
              :disabled="isEditMode"
              max-width="400px"
              top
            >
              <template #activator="{ props }">
                <td
                  v-bind="props"
                  :style="{
                    width: `${100 / (probabilityLevels.length + 1)}%`,
                    border: 'var(--veo-risk-matrix-border)'
                  }"
                  class="text-center px-0 py-0"
                >
                  <div
                    :style="{
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      flex: 1,
                      backgroundColor: getRiskValue(rowIndex, cellIndex)?.htmlColor,
                      color: getMostContrastyColor(getRiskValue(rowIndex, cellIndex)?.htmlColor)
                    }"
                  >
                    <v-row v-if="isEditMode">
                      <v-autocomplete
                        v-if="riskValues && getRiskValue(rowIndex, cellIndex)"
                        v-model="valueMatrix.at(-1 - rowIndex)[cellIndex]"
                        :items="riskValues"
                        :item-title="`translations.${locale}.name`"
                        :item-value="(item) => item"
                        density="compact"
                      />
                    </v-row>
                    <span v-else>
                      {{ getRiskValue(rowIndex, cellIndex)?.translations?.[locale]?.name || t('missingValue') }}
                    </span>
                  </div>
                </td>
              </template>
            </v-tooltip>
          </tr>
        </tbody>
      </v-table>
    </div>
  </v-card-text>
</template>

<script setup lang="ts">
import { getMostContrastyColor } from '~/lib/utils';
import type { IVeoRiskPotentialImpact, IVeoRiskProbabilityLevel, IVeoRiskValueLevel } from '~/types/VeoTypes';
const { t } = useVeoI18n();
const { locale } = useI18n();

const props = withDefaults(
  defineProps<{
    potentialImpacts?: IVeoRiskPotentialImpact[];
    riskValues?: IVeoRiskValueLevel[];
    probabilityLevels?: IVeoRiskProbabilityLevel[];
    isEditMode?: boolean;
  }>(),
  {
    potentialImpacts: () => [],
    riskValues: () => [],
    probabilityLevels: () => [],
    isEditMode: false
  }
);

const valueMatrix = defineModel<IVeoRiskValueLevel[][]>('value-matrix', { default: [] });

// Getters for static matrix values
const getImpact = (rowIndex: number) => props.potentialImpacts?.at(-1 - rowIndex);
const getRiskValue = (rowIndex: number, cellIndex: number) => valueMatrix.value?.at(-1 - rowIndex)?.[cellIndex];
</script>

<i18n src="~/locales/base/components/risk-risk-elements-matrix.json"></i18n>
<style scoped>
th,
td,
td > div {
  border-radius: 4px;
}

:deep(.v-input__details) {
  display: none;
}

.veo-risk-matrix {
  --veo-risk-matrix-border: 1px solid white;

  /* Remove input borders from vuetify component */
  :deep(.v-field__outline) {
    --v-field-border-width: 0;
  }
}

.no-borders {
  border: none !important;
}

th {
  margin-bottom: 8px;
}

.title-cell {
  padding: 0 !important;
  border: none;
}

.probability-title,
.impact-title {
  font-size: 1.2em;
}

.impact-title {
  @supports (writing-mode: sideways-lr) {
    writing-mode: sideways-lr;
  }

  @supports not (writing-mode: sideways-lr) {
    transform: rotate(-90deg);
  }
}
</style>
