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
  <v-row data-component-name="risk-matrix-wrapper">
    <v-container>
      <v-row v-if="!domainIsFetching">
        <v-col cols="12" md="6">
          <v-card class="mb-6 elevation-2" outlined>
            <div class="d-flex border-b pb-2">
              <!-- Risikokategorien -->
              <RiskLegends
                :get-most-contrasty-color="getMostContrastyColor"
                :title="t('riskCategories')"
                :items="riskValues"
              />
              <RiskLegends
                :get-most-contrasty-color="getMostContrastyColor"
                :title="t('probability')"
                :items="probabilities"
              />
            </div>

            <!-- Kriterien -->
            <v-card-title><span>Kriterien</span></v-card-title>
            <v-row v-for="(protectionGoal, index) in protectionGoals" :key="index" style="padding: 0rem 1rem">
              <RiskCriterion v-bind="getMatrixData(protectionGoal.id)" :title="protectionGoal.text" />
            </v-row>

            <!-- Neues Kriterium -->
            <v-row>
              <v-col cols="12">
                <div class="px-4 pb-4">
                  <v-btn class="dashed-border text-center elevation-1" outlined block> + {{ t('NewCriterion') }}</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <v-skeleton-loader v-else type="image" width="600px" />
    </v-container>
  </v-row>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-risks-matrix';
</script>

<script setup lang="ts">
import { cloneDeep, reverse } from 'lodash';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import RiskCriterion from '~/components/risk/riskElements/RiskCriterion.vue';
import RiskLegends from '~/components/risk/riskElements/RiskLegends.vue';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import { useQuery } from '~/composables/api/utils/query';

const { t, locale } = useI18n();
const route = useRoute();

const fetchDomainQueryParameters = computed(() => ({
  id: route.params.domain as string
}));

const { data: domain, isFetching: domainIsFetching } = useQuery(
  domainQueryDefinitions.queries.fetchDomain,
  fetchDomainQueryParameters
);

const data = computed(() => domain.value?.riskDefinitions?.[route.params.matrix as string]);

const probabilities = computed(() => data.value?.probability.levels || []);
const riskValues = computed(() => data.value?.riskValues || []);

const protectionGoals = computed(() =>
  (data.value?.categories || []).map((category) => ({
    text: category.translations[locale.value]?.name || Object.values(category.translations)[0].name,
    id: category.id
  }))
);

const getMatrixData = (protectionGoal: string) => {
  const category = data.value?.categories.find((category) => category.id === protectionGoal);

  return {
    impacts: cloneDeep(category?.potentialImpacts || []),
    value: reverse(cloneDeep(category?.valueMatrix || [])),
    probabilities: data.value?.probability.levels || [],
    riskValues: data.value?.riskValues || []
  };
};

// Static data
const CONTRAST_THRESHOLD = 90;

const getMostContrastyColor = (backgroundColor: string) => {
  if (backgroundColor) {
    const hex = backgroundColor.substring(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return r * 0.299 + g * 0.587 + b * 0.114 > CONTRAST_THRESHOLD ? '#000000' : '#ffffff';
  } else {
    return '#000000';
  }
};
</script>
<i18n>
  {
    "en": {
      "impact": "impact",
      "noData": "no data",
      "probability": "probability",
      "riskCategories": "Risk categories",
      "criterion": "New criterion",
      
    },
    "de": {
      "impact": "auswirkung",
      "noData": "keine Daten",
      "criterion": "Neues Kriterium",
      "riskCategories": "Risikokategorien",
      "probability": "Eintrittswahrscheinlichkeit"
    }
  }
  </i18n>
<style scoped>
.mb-6 {
  margin-bottom: 24px;
}
.mx-1 {
  margin-inline: 8px;
}
.elevation-2 {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.dashed-border {
  border: 2px dashed gray;
}
.d-flex {
  display: flex;
}
.text-center {
  text-align: center;
}
</style>
