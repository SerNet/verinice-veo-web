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
  <div>
    <div class="risk-definitions">
      <VeoTabs v-model="activeTab">
        <!-- Disabled tabs until more risk definitions are available -->
        <!--<template
          v-if="!!domain"
          #tabs
        >
          <v-tab
            v-for="riskDefinition of domain.riskDefinitions"
            :key="riskDefinition.id"
          >
            {{ riskDefinition.id }}
          </v-tab>
        </template>
        <template
          v-else
          #tabs
        >
          <v-tab
            v-for="index in 2"
            :key="index"
            disabled
          >
            <v-skeleton-loader
              height="24px"
              style="border-radius: 999px"
              type="image"
              width="100px"
            />
          </v-tab>
        </template>-->
        <template
          v-if="!!domain"
          #items
        >
          <v-tab-item
            v-for="riskDefinition of domain.riskDefinitions"
            :key="riskDefinition.id"
          >
            <h2 class="text-h2">
              {{ upperFirst(t('probability').toString()) }}
            </h2>
            <VeoCard>
              <v-card-text>
                <v-row>
                  <v-col
                    xs="12"
                    md="4"
                  >
                    <v-select
                      :value="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].probability.potentialProbability"
                      color="primary"
                      :label="upperFirst(t('potentialProbability').toString())"
                      :items="probabilities"
                      disabled
                    >
                      <template
                        v-if="formIsDirty"
                        #selection
                      >
                        {{ t('saveCTA') }}
                      </template>
                    </v-select>
                  </v-col>
                  <v-col
                    xs="12"
                    md="4"
                  >
                    <v-select
                      v-model="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].probability.specificProbability"
                      color="primary"
                      :label="upperFirst(t('specificProbability').toString())"
                      :items="probabilities"
                      clearable
                    />
                  </v-col>
                  <v-col
                    xs="12"
                    md="4"
                  >
                    <v-select
                      :value="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].probability.effectiveProbability"
                      color="primary"
                      :label="upperFirst(t('effectiveProbability').toString())"
                      :items="probabilities"
                      disabled
                    >
                      <template
                        v-if="formIsDirty"
                        #selection
                      >
                        {{ t('saveCTA') }}
                      </template>
                    </v-select>
                  </v-col>
                  <v-col
                    xs="12"
                    md="12"
                  >
                    <v-textarea
                      v-model="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].probability.specificProbabilityExplanation"
                      :label="upperFirst(t('explanation').toString())"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </VeoCard>
            <h2 class="text-h2 mt-4">
              {{ upperFirst(t('impact').toString()) }}
            </h2>
            <VeoCard>
              <v-card-text>
                <v-row>
                  <v-col
                    v-for="(protectionGoal, index) of riskDefinition.categories"
                    :key="protectionGoal.id"
                    cols="6"
                    md="3"
                  >
                    <h3 class="text-h3">
                      {{ protectionGoal.name }}
                    </h3>
                    <v-select
                      :value="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].impactValues[index].potentialImpact"
                      color="primary"
                      :label="upperFirst(t('potentialImpact').toString())"
                      :items="impacts[protectionGoal.id]"
                      disabled
                    >
                      <template
                        v-if="formIsDirty"
                        #selection
                      >
                        {{ t('saveCTA') }}
                      </template>
                    </v-select>
                    <v-select
                      v-model="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].impactValues[index].specificImpact"
                      color="primary"
                      :label="upperFirst(t('specificImpact').toString())"
                      :items="impacts[protectionGoal.id]"
                      clearable
                    />
                    <v-textarea
                      v-model="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].impactValues[index].specificImpactExplanation"
                      :label="upperFirst(t('explanation').toString())"
                      clearable
                    />
                    <v-select
                      :value="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].impactValues[index].effectiveImpact"
                      color="primary"
                      :label="upperFirst(t('effectiveImpact').toString())"
                      :items="impacts[protectionGoal.id]"
                      disabled
                    >
                      <template
                        v-if="formIsDirty"
                        #selection
                      >
                        {{ t('saveCTA') }}
                      </template>
                    </v-select>
                  </v-col>
                </v-row>
              </v-card-text>
            </VeoCard>
            <h2 class="text-h2 mt-4">
              {{ upperFirst(t('inherentRisk').toString()) }}
            </h2>
            <VeoCard>
              <v-card-text>
                <v-row>
                  <v-col
                    v-for="(protectionGoal, index) of riskDefinition.categories"
                    :key="protectionGoal.id"
                    cols="6"
                    md="3"
                  >
                    <h3 class="text-h3">
                      {{ protectionGoal.name }}
                    </h3>
                    <v-select
                      :value="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].riskValues[index].inherentRisk"
                      color="primary"
                      :label="upperFirst(t('inherentRisk').toString())"
                      :items="riskValues"
                      disabled
                    >
                      <template
                        v-if="formIsDirty"
                        #selection
                      >
                        {{ t('saveCTA') }}
                      </template>
                    </v-select>
                  </v-col>
                </v-row>
              </v-card-text>
            </VeoCard>
            <h2 class="text-h2 mt-4">
              {{ upperFirst(t('residualRisk').toString()) }}
            </h2>
            <VeoCard>
              <v-card-text>
                <v-row>
                  <v-col
                    v-for="(protectionGoal, index) of riskDefinition.categories"
                    :key="protectionGoal.id"
                    cols="6"
                    md="3"
                  >
                    <h3 class="text-h3">
                      {{ protectionGoal.name }}
                    </h3>
                    <v-select
                      v-model="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].riskValues[index].riskTreatments"
                      multiple
                      color="primary"
                      :label="upperFirst(t('riskTreatment').toString())"
                      :items="treatmentOptions"
                      class="veo-risk-dialog__risk-treatment-selection"
                    >
                      <template #selection="{ item, index: selectionIndex }">
                        <span
                          v-if="selectionIndex === 0"
                          class="text-no-wrap"
                        >
                          {{ item.text }}
                        </span>
                        <v-chip
                          v-else-if="selectionIndex === 1"
                          small
                          class="flex-shrink-0"
                        >
                          +{{ internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].riskValues[index].riskTreatments.length }}
                        </v-chip>
                      </template>
                    </v-select>
                    <v-textarea
                      v-model="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].riskValues[index].riskTreatmentExplanation"
                      :label="upperFirst(t('explanation').toString())"
                      clearable
                    />
                    <v-select
                      v-model="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].riskValues[index].residualRisk"
                      color="primary"
                      :label="upperFirst(t('residualRisk').toString())"
                      :items="riskValues"
                      clearable
                    />
                    <v-textarea
                      v-model="internalValue.domains[domain.id].riskDefinitions[riskDefinition.id].riskValues[index].residualRiskExplanation"
                      :label="upperFirst(t('explanation').toString())"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </VeoCard>
          </v-tab-item>
        </template>
      </VeoTabs>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { IBaseObject } from '~/lib/utils';
import { IVeoDomain, IVeoRisk } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<IVeoRisk>,
      required: true
    },
    domain: {
      type: Object as PropType<IVeoDomain>,
      default: () => undefined
    },
    formIsDirty: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    const internalValue = computed({
      get() {
        return props.value;
      },
      set(newValue: IVeoRisk) {
        emit('input', newValue);
      }
    });

    const activeTab = ref(0);
    const activeRiskDefinition = computed(() => Object.values(props.domain?.riskDefinitions || {})[activeTab.value]);

    const probabilities = activeRiskDefinition.value?.probability.levels.map((level) => ({ text: level.name, value: level.ordinalValue }));

    const impacts = activeRiskDefinition.value?.categories.reduce((previousValue: IBaseObject, currentValue) => {
      previousValue[currentValue.id] = currentValue.potentialImpacts.map((level) => ({ text: level.name, value: level.ordinalValue }));
      return previousValue;
    }, {});

    const riskValues = activeRiskDefinition.value?.riskValues.map((level) => ({ text: level.name, value: level.ordinalValue }));

    const treatmentOptions = computed(() =>
      ['RISK_TREATMENT_NONE', 'RISK_TREATMENT_ACCEPTANCE', 'RISK_TREATMENT_AVOIDANCE', 'RISK_TREATMENT_REDUCTION', 'RISK_TREATMENT_TRANSFER'].map((option) => ({
        text: t(`riskTreatments.${option}`).toString(),
        value: option
      }))
    );

    return {
      activeTab,
      activeRiskDefinition,
      impacts,
      internalValue,
      probabilities,
      riskValues,
      treatmentOptions,

      upperFirst,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "effectiveImpact": "effective impact",
    "effectiveProbability": "effective probability",
    "explanation": "explanation",
    "impact": "impact",
    "inherentRisk": "inherent risk",
    "potentialImpact": "potential impact",
    "potentialProbability": "potential probability",
    "probability": "probability",
    "protectionGoals": "protection goals",
    "residualRisk": "residual risk",
    "riskTreatment": "risk treatment",
    "riskTreatments": {
      "RISK_TREATMENT_ACCEPTANCE": "risk retention",
      "RISK_TREATMENT_AVOIDANCE": "risk avoidance",
      "RISK_TREATMENT_NONE": "none",
      "RISK_TREATMENT_REDUCTION": "risk reduction",
      "RISK_TREATMENT_TRANSFER": "risk transfer"
    },
    "saveCTA": "save to recompute",
    "specificImpact": "specific impact",
    "specificProbability": "specific probability"
  },
  "de": {
    
    
    "effectiveImpact": "Effektive Auswirkung",
    "effectiveProbability": "Effektive Wahrscheinlichkeit",
    "explanation": "Erklärung",
    "impact": "Auswirkung",
    "inherentRisk": "Brutto-Risiko",
    "potentialImpact": "potentielle Auswirkung",
    "potentialProbability": "potentielle Wahrscheinlichkeit",
    "probability": "Eintrittswahrscheinlichkeit",
    "protectionGoals": "Schutzziele",
    "residualRisk": "verbleibendes Risiko",
    "riskTreatment": "Risikobehandlung",
    "riskTreatments": {
      "RISK_TREATMENT_ACCEPTANCE": "Risiko-Akzeptanz",
      "RISK_TREATMENT_AVOIDANCE": "Risikovermeidung",
      "RISK_TREATMENT_NONE": "Keins",
      "RISK_TREATMENT_REDUCTION": "Risikominderung",
      "RISK_TREATMENT_TRANSFER": "Risikotransfer"
    },
    "saveCTA": "Speichern zum Neuberechnen",
    "specificImpact": "spezifische Auswirkungen",
    "specificProbability": "spezifische Wahrscheinlichkeit"
  }
}
</i18n>

<style lang="scss" scoped>
.risk-definitions {
  border-radius: 16px;
  overflow: hidden;
}

.veo-risk-dialog__risk-treatment-selection ::v-deep.v-select__selections {
  flex-wrap: nowrap;
}
</style>