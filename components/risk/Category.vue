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
  <v-col cols="12">
    <v-card class="pa-2">
      <div class="d-flex justify-space-between align-center">
        <div class="d-flex d-flex justify-space-between flex-grow-1">
          <v-card-title class="pr-0">{{ riskCategory.translations?.[locale]?.name ?? '' }}</v-card-title>

          <v-card-actions>
            <v-btn :icon="mdiDelete" variant="plain" size="small" class="d-none" />
            <v-btn
              :icon="mdiPencil"
              variant="plain"
              size="small"
              :to="`${route.path}/edit?id=${riskCategory.id ?? ''}`"
            />
          </v-card-actions>
        </div>
      </div>

      <RiskProperty
        v-if="!valueMatrix.length && potentialImpacts.length"
        :title="t('impact')"
        :items="potentialImpacts"
      />

      <RiskMatrix
        v-else-if="valueMatrix.length"
        :value-matrix="valueMatrix"
        :potential-impacts="potentialImpacts"
        :risk-values="riskValues"
        :probability-levels="probabilityLevels"
      />

      <!-- No valueMatrix -->
      <v-card-subtitle v-else class="pr-0">{{ t('noMatrix') }}</v-card-subtitle>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { mdiDelete, mdiPencil } from '@mdi/js';
import type {
  IVeoRiskCategory,
  IVeoRiskPotentialImpact,
  IVeoRiskProbabilityLevel,
  IVeoRiskValueLevel
} from '~/types/VeoTypes';

defineProps<{
  valueMatrix: IVeoRiskValueLevel[][];
  potentialImpacts: IVeoRiskPotentialImpact[];
  riskValues: IVeoRiskValueLevel[];
  probabilityLevels: IVeoRiskProbabilityLevel[];
  riskCategory: IVeoRiskCategory;
}>();

const { locale } = useI18n();
const { t } = useVeoI18n();
const route = useRoute();
</script>
<i18n src="~/locales/base/components/risk-risk-elements-risk-criterion.json"></i18n>
