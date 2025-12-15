<!--
   - verinice.veo web
   - Copyright (C) 2025 Haneen Husin
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
  <v-btn
    :disabled="!canSave"
    size="large"
    class="my-6"
    color="primary"
    variant="flat"
    data-veo-test="save-risk-definition-with-evaluation-button"
    @click="evaluateRiskDefinition"
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
import { getUpdatedRiskDefinition } from './wizard/helpers';
import type {
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
  save: (riskDefinition: IVeoDomainRiskDefinition) => void;
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
  props.save(evaluation.value?.riskDefinition);
}

async function evaluateRiskDefinition() {
  const newRiskDefinition = getUpdatedRiskDefinition(
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
