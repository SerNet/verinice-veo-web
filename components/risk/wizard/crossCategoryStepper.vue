<template>
  <v-stepper v-model="step" style="width: 100%" non-linear>
    <v-stepper-header>
      <v-stepper-item :ref="(el) => setStepperRef(el, 0)" :title="t('editRiskValues')" :value="1" editable />
      <v-divider />

      <v-stepper-item :ref="(el) => setStepperRef(el, 1)" :title="t('editProbabilities')" :value="2" editable />
      <v-divider />

      <template v-for="(_riskCategory, index) in riskCategories" :key="_riskCategory.id">
        <v-stepper-item
          :ref="(el) => setStepperRef(el, index + stepOffset)"
          :title="t('edit', { item: riskCategories?.[index]?.translations?.[locale]?.name ?? '' })"
          :value="index + stepOffset"
          editable
        />
        <v-divider />
      </template>

      <v-stepper-item :title="t('summary')" :value="riskCategories?.length + stepOffset" editable />
    </v-stepper-header>
  </v-stepper>

  <v-window v-model="step" class="my-6" style="width: 100%">
    <v-window-item :value="1">
      <RiskDefinitionEditor
        :data="riskValues"
        @add-item="createRiskValue"
        @remove-item="deleteRiskValue"
        @change-item="(index, value) => handleChange(index, value, riskValues)"
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

          <template v-if="!riskCategories[index]?.valueMatrix?.length && potentialImpacts[index].length">
            <RiskProperty :title="t('impact')" :items="potentialImpacts[index]" />
            <v-card-subtitle class="pr-0">
              <span>{{ t('noMatrix') }}{{ ' ' }}</span>
              <span>{{ t('createMatrixInCategory') }}</span>
            </v-card-subtitle>
          </template>

          <RiskMatrix
            v-else
            :value-matrix="riskCategories[index]?.valueMatrix"
            :probability-levels="probabilityLevels"
            :risk-values="riskValues"
            :potential-impacts="potentialImpacts[index]"
            :is-edit-mode="true"
          />
        </v-card>
      </v-window-item>
    </template>

    <v-window-item :value="riskCategories?.length + stepOffset">
      <template v-for="(category, rcIndex) in riskCategories" :key="category.id">
        <v-card class="pa-2 mb-4">
          <v-card-title>{{ riskCategories?.[rcIndex]?.translations?.[locale]?.name ?? '' }} </v-card-title>

          <template v-if="!riskCategories[rcIndex]?.valueMatrix?.length && potentialImpacts[rcIndex].length">
            <RiskProperty :title="t('impact')" :items="potentialImpacts[rcIndex]" />

            <v-card-subtitle class="pr-0">
              <span>{{ t('noMatrix') }}{{ ' ' }}</span>
              <span>{{ t('createMatrixInCategory') }}</span>
            </v-card-subtitle>
          </template>

          <RiskMatrix
            v-else
            :value-matrix="riskCategories[rcIndex]?.valueMatrix"
            :risk-values="riskValues"
            :probability-levels="probabilityLevels"
            :potential-impacts="potentialImpacts[rcIndex]"
          />
        </v-card>
      </template>
    </v-window-item>
  </v-window>
</template>
<script setup lang="ts">
import type {
  IVeoRiskValueLevel,
  IVeoRiskCategory,
  IVeoRiskProbabilityLevel,
  IVeoRiskPotentialImpact
} from '~/types/VeoTypes';

const props = defineProps<{
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
  validateNames: (input: string, items: IVeoRiskPotentialImpact[] | IVeoRiskValueLevel[]) => void;
}>();

const { t } = useI18n();

const step = defineModel<number>('step', { default: 1 });
const stepOffset = 3;
const { setStepperRef } = useSideScroll(step); // Make stepper side-scrollable

function handleChange(index: number, value: string, items: IVeoRiskPotentialImpact[] | IVeoRiskProbabilityLevel[]) {
  props.validateNames(value, items);
  props.updateRiskValue(index);
}
</script>
<i18n src="~/locales/base/pages/unit-domains-domain-risks.json"></i18n>
<i18n src="~/locales/base/pages/unit-domains-domain-risks-matrix.json"></i18n>
