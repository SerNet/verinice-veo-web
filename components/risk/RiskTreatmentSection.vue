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
      {{ upperFirst(t('riskTreatment').toString()) }}
    </h2>
    <BaseCard border padding>
      <v-row>
        <template v-for="riskCriterion of filteredRiskCriteria" :key="riskCriterion.id">
          <RiskTreatmentSectionColumn
            :disabled="disabled"
            :protection-goal="riskCriterion"
            :risk-definition="riskDefinition"
            :num-of-cols="filteredRiskCriteria.length"
            v-bind="data.find((riskValue) => riskValue.category === riskCriterion.id)"
            @update:risk-treatments="onRiskTreatmentChanged(riskCriterion.id, $event)"
            @update:risk-treatment-explanation="onRiskTreatmentExplanationChanged(riskCriterion.id, $event)"
          />
        </template>
      </v-row>
    </BaseCard>
  </div>
</template>

<script lang="ts">
import { cloneDeep, upperFirst } from 'lodash';
import { PropType } from 'vue';

import { IVeoDomainRiskDefinition, IVeoRiskCategory, IVeoRiskDefinition, VeoRiskTreatment } from '~/types/VeoTypes';
import { IDirtyFields } from './CreateDialogSingle.vue';

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
    const filteredRiskCriteria = computed(() =>
      props.riskDefinition.categories.filter(
        (riskCriterion) => riskCriterionExists(riskCriterion.id) && riskMatrixExists(riskCriterion)
      )
    );
    const riskCriterionExists = (riskCriterion: string) =>
      !!props.data.find((riskValue) => riskValue.category === riskCriterion);

    const riskMatrixExists = (riskCriterion: IVeoRiskCategory) => !!riskCriterion.valueMatrix;

    const onRiskTreatmentChanged = (riskCriterion: string, newValue: VeoRiskTreatment[]) => {
      const localData = cloneDeep(props.data);
      const riskValue = localData.find((riskValue) => riskValue.category === riskCriterion);
      if (riskValue) {
        riskValue.riskTreatments = newValue;
      }
      emit('update:data', localData);
      emit('update:dirty-fields', {
        ...props.dirtyFields,
        [`${props.riskDefinition.id}_${riskCriterion}_riskTreatments`]: true
      });
    };

    const onRiskTreatmentExplanationChanged = (riskCriterion: string, newValue: string) => {
      const localData = cloneDeep(props.data);
      const riskValue = localData.find((riskValue) => riskValue.category === riskCriterion);
      if (riskValue) {
        riskValue.riskTreatmentExplanation = newValue;
      }
      emit('update:data', localData);
    };

    return {
      onRiskTreatmentChanged,
      onRiskTreatmentExplanationChanged,
      t,
      filteredRiskCriteria,
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
