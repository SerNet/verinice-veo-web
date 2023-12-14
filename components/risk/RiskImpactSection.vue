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
      {{ upperFirst(t('impact').toString()) }}
    </h2>
    <BaseCard class="veo-section-border">
      <v-card-text class="pa-4 px-4">
        <v-row>
          <template v-for="protectionGoal of riskDefinition.categories">
            <RiskImpactSectionColumn
              v-if="protectionGoalExists(protectionGoal.id)"
              :key="protectionGoal.id"
              :dirty-fields="dirtyFields"
              :protection-goal="protectionGoal"
              :disabled="disabled"
              :risk-definition="riskDefinition"
              v-bind="data.find((impactValue) => impactValue.category === protectionGoal.id)"
              @update:specific-impact-explanation="onSpecificImpactExplanationChanged(protectionGoal.id, $event)"
              @update:specific-impact="onSpecificImpactChanged(protectionGoal.id, $event)"
            />
          </template>
        </v-row>
      </v-card-text>
    </BaseCard>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { cloneDeep, upperFirst } from 'lodash';

import { IDirtyFields } from './CreateDialogSingle.vue';
import { IVeoDomainRiskDefinition, IVeoRiskDefinition } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    data: {
      type: Array as PropType<IVeoRiskDefinition['impactValues']>,
      required: true
    },
    riskDefinition: {
      type: Object as PropType<IVeoDomainRiskDefinition>,
      required: true
    },
    dirtyFields: {
      type: Object as PropType<IDirtyFields>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:data', 'update:dirty-fields'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const protectionGoalExists = (protectionGoal: string) => !!props.data.find((impactValue) => impactValue.category === protectionGoal);

    const onSpecificImpactExplanationChanged = (protectionGoal: string, newValue: string) => {
      const localData = cloneDeep(props.data);
      const impactValue = localData.find((impactValue) => impactValue.category === protectionGoal);
      if (impactValue) {
        impactValue.specificImpactExplanation = newValue;
      }
      emit('update:data', localData);
    };

    const onSpecificImpactChanged = (protectionGoal: string, newValue: string) => {
      emit('update:dirty-fields', { ...props.dirtyFields, [`${props.riskDefinition.id}_${protectionGoal}_specificImpact`]: true });

      const localData = cloneDeep(props.data);
      const impactValue = localData.find((impactValue) => impactValue.category === protectionGoal);
      if (impactValue) {
        impactValue.specificImpact = newValue;
      }
      emit('update:data', localData);
    };

    return {
      onSpecificImpactChanged,
      onSpecificImpactExplanationChanged,
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
    "impact": "impact"
  },
  "de": {
    "impact": "Auswirkung"
  }
}
</i18n>
