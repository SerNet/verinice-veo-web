<template>
  <v-stepper v-model="step" style="width: 100%" non-linear>
    <v-stepper-header>
      <v-stepper-item :title="t('editRiskValues')" :value="1" editable></v-stepper-item>
      <v-divider></v-divider>

      <v-stepper-item :title="t('editRiskImpacts')" :value="2" editable></v-stepper-item>
      <v-divider></v-divider>

      <template v-for="(_riskCategory, index) in riskCategories" :key="_riskCategory.id">
        <v-stepper-item
          :title="t('edit', { item: riskCategories?.[index]?.translations?.[locale]?.name ?? '' })"
          :value="index + stepOffset"
          editable
        ></v-stepper-item>
        <v-divider></v-divider>
      </template>

      <v-stepper-item :title="t('summary')" :value="riskCategories?.length + stepOffset" editable> </v-stepper-item>
    </v-stepper-header>
  </v-stepper>

  <v-window v-model="step" class="my-6" style="width: 100%">
    <v-window-item :value="1">
      <RiskDefinitionEditor
        :data="riskValues"
        @add-item="createRiskValue"
        @remove-item="deleteRiskValue"
        @change-item="updateRiskValue"
      />
    </v-window-item>

    <v-window-item :value="2">
      <RiskDefinitionEditor
        :data="probabilityLevels"
        @add-item="createProbabilityLevel"
        @remove-item="deleteProbabilityLevel"
      />
    </v-window-item>

    <template v-for="(_riskCategory, index) in riskCategories" :key="_riskCategory.id">
      <v-window-item :value="index + stepOffset" variant="elevated">
        <v-card class="pa-2">
          <v-card-title>
            {{ riskCategories?.[index]?.translations?.[locale]?.name ?? '' }}
          </v-card-title>

          <RiskProperty
            v-if="!riskCategories[index]?.valueMatrix.length && potentialImpacts[index].length"
            :title="t('impact')"
            :items="potentialImpacts[index]"
          />

          <RiskMatrix
            v-else-if="riskCategories[index]?.valueMatrix.length"
            :value-matrix="riskCategories[index]?.valueMatrix"
            :probability-levels="probabilityLevels"
            :risk-values="riskValues"
            :potential-impacts="potentialImpacts[index]"
            :is-edit-mode="true"
          />

          <v-card-subtitle v-else class="pr-0">{{ t('noMatrix') }}</v-card-subtitle>
        </v-card>
      </v-window-item>

      <v-window-item :value="riskCategories?.length + stepOffset">
        <template v-for="(_category, rcIndex) in riskCategories?.length" :key="_category.id">
          <v-card class="pa-2 mb-4">
            <v-card-title>{{ riskCategories?.[index]?.translations?.[locale]?.name ?? '' }} </v-card-title>

            <RiskMatrix
              :value-matrix="riskCategories[rcIndex].valueMatrix"
              :risk-values="riskValues"
              :probability-levels="probabilityLevels"
              :potential-impacts="potentialImpacts[rcIndex]"
            />
          </v-card>
        </template>
      </v-window-item>
    </template>
  </v-window>
</template>
<script setup lang="ts">
import {
  IVeoRiskValueLevel,
  IVeoRiskCategory,
  IVeoRiskProbabilityLevel,
  IVeoRiskPotentialImpact
} from '~/types/VeoTypes';

const { t } = useI18n();

defineProps<{
  locale: string;
  potentialImpacts: IVeoRiskPotentialImpact[][];
  createRiskValue: () => void;
  updateRiskValue: (index: number) => void;
  deleteRiskValue: (index: number) => void;
  createProbabilityLevel: () => void;
  deleteProbabilityLevel: (value: number) => void;
  riskValues: IVeoRiskValueLevel[];
  probabilityLevels: IVeoRiskProbabilityLevel[];
  riskCategories: IVeoRiskCategory[];
}>();

const step = defineModel<number>('step', { default: 1 });
const stepOffset = 3;
</script>
<i18n src="~/locales/base/pages/unit-domains-domain-risks.json"></i18n>
