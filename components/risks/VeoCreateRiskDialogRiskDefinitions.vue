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
    <h2 class="text-h2 mb-2 mt-6">
      {{ upperFirst(t('riskDefinitions').toString()) }}
    </h2>
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
            class="px-4"
          >
            <v-row no-gutters>
              <v-col
                xs="12"
                md="6"
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
                md="12"
              >
                <v-text-field
                  v-model="internalValue[riskDefinition.id].probability.specificProbabilityExplanation"
                  :label="upperFirst(t('explanation').toString())"
                  clearable
                />
              </v-col>
            </v-row>
            <div
              v-for="(protectionGoal, index) of riskDefinition.categories"
              :key="protectionGoal.id"
              class="mt-8"
            >
              <h3 class="text-h3">
                {{ protectionGoal.name }}
              </h3>
              <v-row no-gutters>
                <v-col
                  xs="12"
                  md="6"
                >
                  <v-select
                    v-model="internalValue[riskDefinition.id].impactValues[index].specificImpact"
                    color="primary"
                    :label="upperFirst(t('specificImpact').toString())"
                    :items="impacts[protectionGoal.id]"
                    clearable
                  />
                </v-col>
                <v-col
                  xs="12"
                  md="12"
                >
                  <v-text-field
                    v-model="internalValue[riskDefinition.id].impactValues[index].specificImpactExplanation"
                    :label="upperFirst(t('explanation').toString())"
                    clearable
                  />
                </v-col>
              </v-row>
            </div>
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

    return {
      activeTab,
      activeRiskDefinition,
      impacts,
      internalValue,
      probabilities,

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
    "protectionGoals": "protection goals",
    "riskDefinitions": "risk definitions",
    "specificImpact": "specific impact",
    "specificProbability": "specific probability"
  },
  "de": {
    "explanation": "Erklärung",
    "protectionGoals": "Schutzziele",
    "riskDefinitions": "risikodefinitionen",
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