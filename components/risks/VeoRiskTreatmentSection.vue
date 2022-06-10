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
    <h2 class="text-h2 mt-4">
      {{ upperFirst(t('riskTreatment').toString()) }}
    </h2>
    <VeoCard>
      <v-card-text>
        <v-row>
          <template v-for="protectionGoal of riskDefinition.categories">
            <VeoRiskTreatmentSectionColumn
              v-if="protectionGoalExists(protectionGoal.id)"
              :key="protectionGoal.id"
              :protection-goal="protectionGoal"
              :risk-definition="riskDefinition"
              v-bind="data.find((riskValue) => riskValue.category === protectionGoal.id)"
              @update:risk-treatments="onRiskTreatmentChanged(protectionGoal.id, $event)"
              @update:risk-treatment-explanation="onRiskTreatmentExplanationChanged(protectionGoal.id, $event)"
            />
          </template>
        </v-row>
      </v-card-text>
    </VeoCard>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { cloneDeep, upperFirst } from 'lodash';

import { IDirtyFields } from './VeoCreateRiskDialogSingle.vue';
import { IVeoDomainRiskDefinition, IVeoRiskDefinition } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    data: {
      type: Array as PropType<IVeoRiskDefinition['riskValues']>,
      required: true
    },
    riskDefinition: {
      type: Object as PropType<IVeoDomainRiskDefinition>,
      required: true
    },
    dirtyFields: {
      type: Object as PropType<IDirtyFields>,
      default: () => {}
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    const protectionGoalExists = (protectionGoal: string) => !!props.data.find((riskValue) => riskValue.category === protectionGoal);

    const onRiskTreatmentChanged = (protectionGoal: string, newValue: string[]) => {
      const localData = cloneDeep(props.data);
      const riskValue = localData.find((riskValue) => riskValue.category === protectionGoal);
      if (riskValue) {
        riskValue.riskTreatments = newValue;
      }
      emit('update:data', localData);
      emit('update:dirty-fields', { ...props.dirtyFields, [`${props.riskDefinition.id}_${protectionGoal}_riskTreatments`]: true });
    };

    const onRiskTreatmentExplanationChanged = (protectionGoal: string, newValue: string) => {
      const localData = cloneDeep(props.data);
      const riskValue = localData.find((riskValue) => riskValue.category === protectionGoal);
      if (riskValue) {
        riskValue.riskTreatmentExplanation = newValue;
      }
      emit('update:data', localData);
    };

    return {
      onRiskTreatmentChanged,
      onRiskTreatmentExplanationChanged,
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
    "riskTreatment": "risk treatment"
  },
  "de": {
    "riskTreatment": "Risikobehandlung"
  }
}
</i18n>
