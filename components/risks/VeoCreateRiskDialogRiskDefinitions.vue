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
    <div class="text-body-1 mt-4">
      {{ upperFirst(t('riskDefinitions').toString()) }}:
    </div>
    <div class="risk-definitions">
      <VeoTabs v-model="activeTab">
        <template
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
        </template>
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
                      v-model="internalValue[riskDefinition.id].probability.specificProbability"
                      color="primary"
                      :label="upperFirst(t('potentialProbability').toString())"
                      disabled
                    />
                  </v-col>
                  <v-col
                    xs="12"
                    md="4"
                  >
                    <v-select
                      v-model="internalValue[riskDefinition.id].probability.specificProbability"
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
                      v-model="internalValue[riskDefinition.id].probability.specificProbability"
                      color="primary"
                      :label="upperFirst(t('effectiveProbability').toString())"
                      disabled
                    />
                  </v-col>
                  <v-col
                    xs="12"
                    md="12"
                  >
                    <v-textarea
                      v-model="internalValue[riskDefinition.id].probability.specificProbabilityExplanation"
                      :label="upperFirst(t('explanation').toString())"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </VeoCard>
            <h2 class="text-h2 mt-4">
              {{ upperFirst(t('probability').toString()) }}
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
                      v-model="internalValue[riskDefinition.id].impactValues[index].specificImpact"
                      color="primary"
                      :label="upperFirst(t('potentialImpact').toString())"
                      disabled
                    />
                    <v-select
                      v-model="internalValue[riskDefinition.id].impactValues[index].specificImpact"
                      color="primary"
                      :label="upperFirst(t('specificImpact').toString())"
                      :items="impacts[protectionGoal.id]"
                      clearable
                    />
                    <v-textarea
                      v-model="internalValue[riskDefinition.id].impactValues[index].specificImpactExplanation"
                      :label="upperFirst(t('explanation').toString())"
                      clearable
                    />
                    <v-select
                      v-model="internalValue[riskDefinition.id].impactValues[index].specificImpact"
                      color="primary"
                      :label="upperFirst(t('effectiveImpact').toString())"
                      disabled
                    />
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
                      v-model="internalValue[riskDefinition.id].impactValues[index].specificImpact"
                      color="primary"
                      :label="upperFirst(t('inherentRisk').toString())"
                      disabled
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </VeoCard>
            <h2 class="text-h2">
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
                      v-model="internalValue[riskDefinition.id].riskValues[index].riskTreatments"
                      multiple
                      color="primary"
                      :label="upperFirst(t('riskTreatment').toString())"
                      :items="treatmentOptions"
                      clearable
                    />
                    <v-textarea
                      v-model="internalValue[riskDefinition.id].riskValues[index].riskTreatmentExplanation"
                      :label="upperFirst(t('explanation').toString())"
                      clearable
                    />
                    <v-select
                      v-model="internalValue[riskDefinition.id].riskValues[index].residualRisk"
                      color="primary"
                      :label="upperFirst(t('residualRisk').toString())"
                      :items="riskValues"
                      clearable
                    />
                    <v-textarea
                      v-model="internalValue[riskDefinition.id].riskValues[index].residualRiskExplanation"
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
      type: Object as PropType<IVeoRisk['domains']['x']['riskDefinitions']>,
      required: true
    },
    domain: {
      type: Object as PropType<IVeoDomain>,
      default: () => undefined
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    const internalValue = computed({
      get() {
        return props.value;
      },
      set(newValue: IVeoRisk['domains']['x']['riskDefinitions']) {
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
    "explanation": "explanation",
    "impact": "impact",
    "inherentRisk": "inherent risk",
    "probability": "probability",
    "protectionGoals": "protection goals",
    "residualRisk": "residual risk",
    "riskDefinitions": "risk definitions",
    "riskTreatment": "risk treatment",
    "riskTreatments": {
      "RISK_TREATMENT_ACCEPTANCE": "risk retention",
      "RISK_TREATMENT_AVOIDANCE": "risk avoidance",
      "RISK_TREATMENT_NONE": "none",
      "RISK_TREATMENT_REDUCTION": "risk reduction",
      "RISK_TREATMENT_TRANSFER": "risk transfer"
    },
    "specificImpact": "specific impact",
    "specificProbability": "specific probability"
  },
  "de": {
    "explanation": "Erklärung",
    "impact": "Auswirkung",
    "inherentRisk": "Brutto-Risiko",
    "probability": "Eintrittswahrscheinlichkeit",
    "protectionGoals": "Schutzziele",
    "residualRisk": "verbleibendes Risiko",
    "riskDefinitions": "Risikodefinitionen",
    "riskTreatment": "Risikobehandlung",
    "riskTreatments": {
      "RISK_TREATMENT_ACCEPTANCE": "Risiko-Akzeptanz",
      "RISK_TREATMENT_AVOIDANCE": "Risikovermeidung",
      "RISK_TREATMENT_NONE": "Keins",
      "RISK_TREATMENT_REDUCTION": "Risikominderung",
      "RISK_TREATMENT_TRANSFER": "Risikotransfer"
    },
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
</style>