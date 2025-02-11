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
  <div class="d-flex align-center px-4">
    <v-card-subtitle class="pr-0 px-0">{{ t('riskMatrix') }} </v-card-subtitle>
    <v-btn :icon="mdiPencil" variant="plain" size="small" @click="editRiskMatrix" />
  </div>
  <v-card-text class="pd-0 overflow-x-auto">
    <div class="table-container">
      <v-table class="veo-risk-matrix" density="compact">
        <thead>
          <tr>
            <th class="no-borders"></th>
            <th class="no-borders"></th>

            <th class="title-cell no-borders">
              <div class="probability-title">
                {{ upperFirst(t('probability').toString()) }}
              </div>
            </th>
          </tr>

          <tr>
            <th class="no-borders"></th>
            <th class="no-borders"></th>
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
                    width: `${100 / (probabilities.length + 1)}%`,
                    padding: '12px',
                    textAlign: 'center',
                    border: 'var(--veo-risk-matrix-border)',
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
            <th :style="{ border: 'none' }" :rowspan="impactRows.length + 1" class="title-cell">
              <div class="impact-title">
                {{ upperFirst(t('impact').toString()) }}
              </div>
            </th>
          </tr>
          <tr
            v-for="(_row, rowIndex) in reversedOrdinalValues"
            :key="rowIndex"
            :style="{
              height: '100%',
              width: `${100 / (probabilities.length + 1)}%`,
              textAlign: 'center'
            }"
          >
            <v-tooltip max-width="400px" top :text="getImpactTooltipText(rowIndex)">
              <template #activator="{ props }">
                <td
                  v-bind="props"
                  :style="{
                    height: '100%',
                    padding: '12px',
                    border: 'var(--veo-risk-matrix-border)',
                    backgroundColor: reversedImpacts[rowIndex].htmlColor,
                    width: `${100 / (probabilities.length + 1)}%`,
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
              v-for="(cell, cellIndex) in reversedOrdinalValues[rowIndex]"
              :key="cellIndex"
              :text="getCellTooltipText(riskValues, locale, cell)"
              :disabled="isEditMode"
              max-width="400px"
              top
            >
              <template #activator="{ props }">
                <td
                  v-bind="props"
                  :style="{
                    width: `${100 / (probabilities.length + 1)}%`,
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
                      backgroundColor: riskValues[cell].htmlColor,
                      color: getMostContrastyColor(riskValues[cell].htmlColor)
                    }"
                  >
                    <v-row v-if="isEditMode">
                      <v-autocomplete
                        v-model="reversedOrdinalValues[rowIndex][cellIndex]"
                        :items="rawRiskValues"
                        :item-title="`translations.${locale}.name`"
                        item-value="ordinalValue"
                        density="compact"
                      />
                    </v-row>
                    <span v-else>
                      {{ getRiskValueName(riskValues, locale, cell) }}
                    </span>
                  </div>
                </td>
              </template>
            </v-tooltip>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- RISK MATRIX ACTIONS -->
    <v-container v-if="isEditMode" class="px-0 d-flex justify-end ga-2">
      <v-btn :append-icon="mdiCancel" size="small" variant="outlined" @click="editRiskMatrix">{{ t('cancel') }}</v-btn>
      <v-btn
        :append-icon="mdiFloppy"
        size="small"
        color="primary"
        @click="() => saveRiskValues()"
        >{{ t('save') }}</v-btn
      >
    </v-container>
  </v-card-text>
</template>

<script setup lang="ts">
import { mdiPencil, mdiCancel, mdiFloppy } from '@mdi/js';
import { cloneDeep, reverse, upperFirst } from 'lodash';
import { defineProps } from 'vue';
import riskQueryDefinitions from '~/composables/api/queryDefinitions/risks';

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
  },
  protectionGoalId: {
    type: String,
    required: true
  }
});

const { t, locale } = useI18n();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

const impactRows = ref(['vernachlässigbar', 'begrenzt', 'beträchtlich', 'existenzbedrohend']);

/**
 * Values are reversed to correctly render the matrix:
 * severity levels should increase from bottom to top
 */
const reversedOrdinalValues = ref<number[][]>(reverse(props.value.map((value) => value.map((v) => v.ordinalValue))));
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
function translate<T>(translations: { [lang: string]: T }): T {
  return translations[locale.value] || Object.values(translations)[0];
}

const isEditMode = ref(false);
function editRiskMatrix() {
  isEditMode.value = !isEditMode.value;
}

// Render risk values
const { data: currentDomain } = useCurrentDomain();

const { mutateAsync: updateRiskMatrixValues } = useMutation(riskQueryDefinitions.queries.mutations.update);

const { isLoading, isLoadingInfo } = useGlobalLoadingState();
isLoadingInfo.value = t('messages.isUpdatingRiskMatrix');

const config = useRuntimeConfig();
const route = useRoute();
const riskDefinitionId = computed(() => route.params?.matrix as string);
const rawRiskValues = computed(() => toRaw(props.riskValues));

function getCellTooltipText(riskValues: IVeoRiskProbabilityLevel[], locale: string, ordinalValue: number) {
  const riskValue = riskValues?.find((rv) => rv.ordinalValue == ordinalValue);
  return riskValue ? riskValue.translations[locale]?.description : '';
}

function getRiskValueName(riskValues: IVeoRiskProbabilityLevel[], locale: string, ordinalValue: number) {
  const riskValue = riskValues.find((rv) => rv.ordinalValue == ordinalValue);
  return riskValue ? riskValue.translations[locale]?.name : '';
}

// Mutate risk values
function prepareRiskValues(reversedOrdinalValues: number[][], _rawRiskValues = rawRiskValues.value) {
  const ordinalValues = reverse(toRaw(reversedOrdinalValues));
  const newRiskValues = ordinalValues.map((ova: number[]) =>
    ova.map((ov) => _rawRiskValues.find((rw) => rw.ordinalValue == ov))
  );
  return newRiskValues;
}

async function saveRiskValues(
  reversedOrdinals = reversedOrdinalValues.value,
  definitionId = riskDefinitionId.value,
  categoryId = props.protectionGoalId,
  domainId = currentDomain.value.id
) {
  try {
    const riskDefinition = cloneDeep(currentDomain.value.raw.riskDefinitions[definitionId]);
    const categoryIndex = riskDefinition.categories.findIndex((category) => category.id == categoryId);
    if (categoryIndex === -1) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }
    const newRiskValues = prepareRiskValues(cloneDeep(reversedOrdinals));
    riskDefinition.categories[categoryIndex].valueMatrix = newRiskValues;

    isLoading.value = true;
    await updateRiskMatrixValues({ json: riskDefinition, domainId, riskDefinitionId: definitionId });
    displaySuccessMessage(t('messages.success'));
  } catch (err) {
    handleError(err);
  } finally {
    isLoading.value = false;
  }
}

function handleError(error: unknown) {
  displayErrorMessage(t('messages.error'));
  if (config.public.debug) console.error(error);
}
</script>

<i18n src="~/locales/base/components/risk-risk-elements-matrix.json"></i18n>

<style scoped>
.veo-risk-matrix {
  --veo-risk-matrix-border: 1px solid white;
}

.no-borders {
  border: none !important;
}

.title-cell {
  padding: 0 !important;
  border: none;
}

.probability-title,
.impact-title {
  font-size: 1.2em;
  font-weight: bold;
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
