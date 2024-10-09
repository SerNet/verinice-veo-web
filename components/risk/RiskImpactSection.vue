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
    <BaseCard border padding>
      <v-row>
        <template v-for="riskCriterion of filteredRiskCriteria" :key="riskCriterion.id">
          <!-- @vue-ignore TODO #3066 not assignable -->
          <RiskImpactSectionColumn
            :dirty-fields="dirtyFields"
            :protection-goal="riskCriterion"
            :disabled="disabled"
            :risk-definition="riskDefinition"
            :num-of-cols="filteredRiskCriteria.length"
            v-bind="data.find((impactValue) => impactValue.category === riskCriterion.id)"
            @update:specific-impact-explanation="onSpecificImpactExplanationChanged(riskCriterion.id, $event)"
            @update:specific-impact="onSpecificImpactChanged(riskCriterion.id, $event)"
          />
        </template>
      </v-row>
    </BaseCard>
  </div>
</template>

<script lang="ts">
import { cloneDeep, upperFirst } from 'lodash';
import { PropType } from 'vue';

import { IVeoDomainRiskDefinition, IVeoRiskCategory, IVeoRiskDefinition } from '~/types/VeoTypes';
import { IDirtyFields } from './CreateDialogSingle.vue';

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

    const filteredRiskCriteria = computed(() =>
      props.riskDefinition.categories.filter(
        (riskCriterion) => riskCriterionExists(riskCriterion.id) && riskMatrixExists(riskCriterion)
      )
    );
    const riskCriterionExists = (riskCriterion: string) =>
      !!props.data.find((impactValue) => impactValue.category === riskCriterion);

    const riskMatrixExists = (riskCriterion: IVeoRiskCategory) => !!riskCriterion.valueMatrix;

    const onSpecificImpactExplanationChanged = (riskCriterion: string, newValue: string) => {
      const localData = cloneDeep(props.data);
      const impactValue = localData.find((impactValue) => impactValue.category === riskCriterion);
      if (impactValue) {
        impactValue.specificImpactExplanation = newValue;
      }
      emit('update:data', localData);
    };

    const onSpecificImpactChanged = (riskCriterion: string, newValue: string) => {
      emit('update:dirty-fields', {
        ...props.dirtyFields,
        [`${props.riskDefinition.id}_${riskCriterion}_specificImpact`]: true
      });

      const localData = cloneDeep(props.data);
      const impactValue = localData.find((impactValue) => impactValue.category === riskCriterion);
      if (impactValue) {
        impactValue.specificImpact = newValue;
      }
      emit('update:data', localData);
    };

    return {
      onSpecificImpactChanged,
      onSpecificImpactExplanationChanged,
      filteredRiskCriteria,
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
