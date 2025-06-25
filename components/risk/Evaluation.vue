<template>
  <v-btn :disabled="!canSave" size="large" class="my-6" color="primary" variant="flat" @click="evaluateRiskDefinition"
    >{{ t('saveRiskDefinition') }}
  </v-btn>
  <RiskInfoDialog
    v-if="hasInfoDialog"
    :effects="evaluation?.effects"
    :has-info-dialog="hasInfoDialog"
    :close-function="closeInfoDialog"
    @save="_save"
    @cancel="hasInfoDialog = false"
  />
</template>
<script setup lang="ts">
import { updateRiskDefinition } from './wizard/helpers';
import {
  IVeoDomainRiskDefinition,
  IVeoRiskCategory,
  IVeoRiskProbabilityLevel,
  IVeoRiskValueLevel
} from '~/types/VeoTypes';

const props = defineProps<{
  riskDefinition: IVeoDomainRiskDefinition;
  riskCategories: IVeoRiskCategory[];
  probabilityLevels: IVeoRiskProbabilityLevel[];
  riskValues: IVeoRiskValueLevel[];
  canSave: boolean;
  save: () => void;
}>();

const { t } = useI18n();

const hasInfoDialog = ref(false);
const { evaluation, evaluate } = useRiskDefinitionEvaluation();

watch(evaluation, () => {
  if (!evaluation.value.effects?.length) return _save();
  hasInfoDialog.value = true;
});

function _save() {
  hasInfoDialog.value = false;
  props.save();
}

async function evaluateRiskDefinition() {
  const newRiskDefinition = updateRiskDefinition(
    props.riskDefinition,
    props.riskCategories,
    props.probabilityLevels,
    props.riskValues
  );

  evaluate(newRiskDefinition);
}

function closeInfoDialog() {
  hasInfoDialog.value = false;
}
</script>
<i18n src="~/locales/base/pages/unit-domains-domain-risks.json"></i18n>
