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
    <h2 class="text-h2 mt-2 mb-1">
      {{ upperFirst(t('residualRisk').toString()) }}
    </h2>
    <BaseCard class="veo-section-border mb-4">
      <v-card-text class="pa-3 px-4">
        <v-row>
          <template v-for="protectionGoal of riskDefinition.categories">
            <RiskResidualSectionColumn
              v-if="protectionGoalExists(protectionGoal.id)"
              :key="protectionGoal.id"
              :disabled="disabled"
              :protection-goal="protectionGoal"
              :risk-definition="riskDefinition"
              :num-of-cols="riskDefinition.categories.length"
              v-bind="
                data.find(
                  (riskValue) => riskValue.category === protectionGoal.id
                )
              "
              @update:user-defined-residual-risk="
                onUserDefinedResidualRiskChanged(protectionGoal.id, $event)
              "
              @update:residual-risk-explanation="
                onResidualRiskExplanationChanged(protectionGoal.id, $event)
              " />
          </template>
        </v-row>
      </v-card-text>
    </BaseCard>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { cloneDeep, upperFirst } from 'lodash';

import { IVeoDomainRiskDefinition, IVeoRiskDefinition } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    data: {
      type: Array as PropType<IVeoRiskDefinition['riskValues']>,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    riskDefinition: {
      type: Object as PropType<IVeoDomainRiskDefinition>,
      required: true
    }
  },
  emits: ['update:data'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const protectionGoalExists = (protectionGoal: string) =>
      !!props.data.find((riskValue) => riskValue.category === protectionGoal);

    const onUserDefinedResidualRiskChanged = (
      protectionGoal: string,
      newValue: number
    ) => {
      const localData = cloneDeep(props.data);
      const riskValueIndex = localData.findIndex(
        (riskValue) => riskValue.category === protectionGoal
      );
      if (riskValueIndex >= 0) {
        localData[riskValueIndex].userDefinedResidualRisk = newValue;
      }
      emit('update:data', localData);
    };

    const onResidualRiskExplanationChanged = (
      protectionGoal: string,
      newValue: string
    ) => {
      const localData = cloneDeep(props.data);
      const riskValue = localData.find(
        (riskValue) => riskValue.category === protectionGoal
      );
      if (riskValue) {
        riskValue.residualRiskExplanation = newValue;
      }
      emit('update:data', localData);
    };

    return {
      onResidualRiskExplanationChanged,
      onUserDefinedResidualRiskChanged,
      protectionGoalExists,

      t,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "residualRisk": "residual risk"
  },
  "de": {
    "residualRisk": "Nettorisiko"
  }
}
</i18n>
