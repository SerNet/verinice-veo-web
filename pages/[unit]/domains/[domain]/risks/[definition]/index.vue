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
  <BasePage data-component-name="unit-selection-page">
    <BaseContainer>
      <template v-if="riskDefinition">
        <v-row data-component-name="risk-matrix-wrapper">
          <v-col cols="12">
            <h1>{{ riskDefinition?.id }}</h1>
          </v-col>
        </v-row>

        <!-- Cross category values -->
        <v-row>
          <v-col cols="12">
            <v-card class="pa-2">
              <div class="d-flex align-center">
                <RiskProperty :title="t('riskValues')" :items="riskDefinition.riskValues" />
                <RiskProperty :title="t('probability')" :items="riskDefinition.probability.levels" />
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Risk categories -->
        <v-row>
          <v-col cols="12">
            <h2>{{ t('criterion') }}</h2>
          </v-col>
          <RiskCategory
            v-for="riskCategory in riskDefinition.categories"
            :key="riskCategory.id"
            :value-matrix="riskCategory.valueMatrix ?? []"
            :potential-impacts="riskCategory.potentialImpacts ?? []"
            :risk-values="riskDefinition.riskValues ?? []"
            :probability-levels="riskDefinition.probability.levels ?? []"
            :risk-category="riskCategory"
          />
        </v-row>
      </template>
      <v-skeleton-loader v-else type="heading"></v-skeleton-loader>
    </BaseContainer>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-risks-definition';
</script>

<script setup lang="ts">
const { t } = useVeoI18n();
const { data: riskDefinition } = useRiskDefinition();
</script>
<i18n src="~/locales/base/pages/unit-domains-domain-risks-matrix.json"></i18n>
<i18n src="~/locales/base/pages/unit-domains-domain-risks.json"></i18n>
