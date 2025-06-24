<template>
  <v-stepper v-model="step" non-linear>
    <v-stepper-header>
      <v-stepper-item
        :ref="(el) => setStepperRef(el, 0)"
        :title="t('editRiskImpacts')"
        :value="1"
        editable
      ></v-stepper-item>
      <v-divider></v-divider>

      <v-stepper-item
        :ref="(el) => setStepperRef(el, 1)"
        :title="t('editRiskMatrix')"
        :value="2"
        editable
      ></v-stepper-item>
      <v-divider></v-divider>

      <v-stepper-item :ref="(el) => setStepperRef(el, 2)" :title="t('summary')" :value="3" editable></v-stepper-item>
    </v-stepper-header>
  </v-stepper>

  <v-window v-model="step" class="my-6" style="width: 100%">
    <!-- Edit potential impacts -->
    <v-window-item :value="1">
      <RiskDefinitionEditor
        :data="potentialImpactsSingleCategory"
        @add-item="createPotentialImpact"
        @remove-item="deletePotentialImpact"
        @change-item="handleChange"
      >
        <template #infoBox>
          <BaseAlert
            :model-value="true"
            :buttons="[
              {
                text: t('createPotentialImpact'),
                onClick: () => createPotentialImpact()
              }
            ]"
            :title="t('createPotentialImpact')"
            :type="VeoAlertType.INFO"
            class="mx-14 my-8"
            flat
            no-close-button
          >
            {{ t('createPotentialImpactBody') }}
          </BaseAlert>
        </template>
      </RiskDefinitionEditor>
    </v-window-item>

    <!-- Edit risk matrix -->
    <v-window-item :value="2">
      <v-card class="pa-8">
        <template v-if="riskCategory.valueMatrix?.length">
          <RiskMatrix
            :value-matrix="riskCategory.valueMatrix"
            :potential-impacts="potentialImpactsSingleCategory"
            :risk-values="riskValues"
            :probability-levels="probabilityLevels"
            :is-edit-mode="true"
          />

          <v-container class="mt-2 d-flex justify-end">
            <v-btn color="primary" variant="outlined" @click="deleteValueMatrix(riskCategory.id)">{{
              t('deleteValueMatrix')
            }}</v-btn>
          </v-container>
        </template>

        <BaseAlert
          v-else
          :model-value="true"
          :buttons="[
            {
              text: t('createValueMatrix'),
              onClick: () => createInitialValueMatrix(riskCategory, potentialImpactsSingleCategory)
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

const props = defineProps<{
  riskValues: IVeoRiskValueLevel[];
  probabilityLevels: IVeoRiskProbabilityLevel[];
  riskCategory: IVeoRiskCategory;
  potentialImpactsSingleCategory: IVeoRiskPotentialImpact[];
  createPotentialImpact: () => void;
  deletePotentialImpact: (index: number) => void;
  createInitialValueMatrix: (
    riskCategory: IVeoRiskCategory,
    potentialImpactsSingleCategory: IVeoRiskPotentialImpact[]
  ) => void;
  deleteValueMatrix: (riskCategoryId: string) => void;
  validateNames: (input: string, items: IVeoRiskPotentialImpact[]) => void;
}>();

function handleChange(_index: number, value: string) {
  props.validateNames(value, props.potentialImpactsSingleCategory);
}

const { t } = useI18n();

const step = defineModel<number>('step', { default: 1 });
const { setStepperRef } = useSideScroll(step); // Make stepper side-scrollable
</script>
<i18n src="~/locales/base/pages/unit-domains-domain-risks.json"></i18n>
