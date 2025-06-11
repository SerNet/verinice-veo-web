<template>
  <v-stepper v-model="step" non-linear>
    <v-stepper-header>
      <v-stepper-item :title="t('editRiskImpacts')" :value="1" editable></v-stepper-item>
      <v-divider></v-divider>

      <v-stepper-item :title="t('editRiskMatrix')" :value="2" editable></v-stepper-item>
      <v-divider></v-divider>

      <v-stepper-item :title="t('summary')" :value="3" editable></v-stepper-item>
    </v-stepper-header>
  </v-stepper>

  <v-window v-model="step" class="my-6" style="width: 100%">
    <!-- Edit potential impacts -->
    <v-window-item :value="1">
      <RiskDefinitionEditor
        :data="potentialImpactsSingleCategory"
        @add-item="createPotentialImpact"
        @remove-item="deletePotentialImpact"
      />
    </v-window-item>

    <!-- Edit risk matrix -->
    <v-window-item :value="2">
      <v-card class="pa-8">
        <RiskMatrix
          v-if="riskCategory.valueMatrix?.length"
          :value-matrix="riskCategory.valueMatrix"
          :potential-impacts="potentialImpactsSingleCategory"
          :risk-values="riskValues"
          :probability-levels="probabilityLevels"
          :is-edit-mode="true"
        />

        <BaseAlert
          v-else
          :model-value="true"
          :buttons="[
            {
              text: t('createValueMatrix'),
              onClick: () => createInitialRiskMatrix(riskCategory, potentialImpactsSingleCategory)
            }
          ]"
          :title="t('createValueMatrix')"
          :type="VeoAlertType.INFO"
          class="mx-14 my-2"
          flat
          no-close-button
        >
          {{ t('createValueMatrixBody') }}
        </BaseAlert>
      </v-card>
    </v-window-item>

    <!-- Summary -->
    <v-window-item :value="3">
      <v-card class="pa-8">
        <RiskMatrix
          :value-matrix="riskCategory.valueMatrix"
          :potential-impacts="potentialImpactsSingleCategory"
          :risk-values="riskValues"
          :probability-levels="probabilityLevels"
        />
      </v-card>
    </v-window-item>
  </v-window>
</template>
<script setup lang="ts">
import { VeoAlertType } from '~/types/VeoTypes';
import type {
  IVeoRiskCategory,
  IVeoRiskPotentialImpact,
  IVeoRiskProbabilityLevel,
  IVeoRiskValueLevel
} from '~/types/VeoTypes';
const { t } = useI18n();

defineProps<{
  riskValues: IVeoRiskValueLevel[];
  probabilityLevels: IVeoRiskProbabilityLevel[];
  riskCategory: IVeoRiskCategory;
  potentialImpactsSingleCategory: IVeoRiskPotentialImpact[];
  createPotentialImpact: () => void;
  deletePotentialImpact: (index: number) => void;
  createInitialRiskMatrix: (
    riskCategory: IVeoRiskCategory,
    potentialImpactsSingleCategory: IVeoRiskPotentialImpact[]
  ) => void;
}>();

const step = defineModel<number>('step', { default: 1 });
</script>
<i18n src="~/locales/base/pages/unit-domains-domain-risks.json"></i18n>
