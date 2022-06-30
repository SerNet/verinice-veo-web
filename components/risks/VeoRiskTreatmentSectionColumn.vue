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
  <v-col
    cols="6"
    md="3"
  >
    <h3 class="text-h3">
      {{ protectionGoal.name }}
    </h3>
    <v-select
      :value="riskTreatments"
      multiple
      color="primary"
      :label="upperFirst(t('riskTreatment').toString())"
      :items="treatmentOptions"
      class="veo-risk-dialog__risk-treatment-selection"
      hide-details
      @input="$emit('update:risk-treatments', $event)"
    >
      <template #selection="{ item, index }">
        <span
          v-if="index === 0"
          class="text-no-wrap"
        >
          {{ item.text }}
        </span>
        <v-chip
          v-else-if="index === 1"
          small
          class="flex-shrink-0"
        >
          +{{ riskTreatments.length }}
        </v-chip>
      </template>
    </v-select>
    <v-edit-dialog>
      <v-text-field
        :value="riskTreatmentExplanation"
        :label="upperFirst(t('explanation').toString())"
        hide-details
        @input="$emit('update:risk-treatment-explanation', $event)"
      />
      <template #input>
        <v-textarea
          :value="riskTreatmentExplanation"
          :label="upperFirst(t('explanation').toString())"
          clearable
          auto-grow
          autofocus
          rows="1"
          no-resize
          @input="$emit('update:risk-treatment-explanation', $event)"
        />
      </template>
    </v-edit-dialog>
  </v-col>  
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';

import { IVeoDomainRiskDefinition, IVeoRiskCategory } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    riskDefinition: {
      type: Object as PropType<IVeoDomainRiskDefinition>,
      required: true
    },
    protectionGoal: {
      type: Object as PropType<IVeoRiskCategory>,
      required: true
    },
    riskTreatments: {
      type: Array as PropType<string[]>,
      default: undefined
    },
    riskTreatmentExplanation: {
      type: String,
      default: undefined
    }
  },
  setup() {
    const { t } = useI18n();

    const treatmentOptions = computed(() =>
      ['RISK_TREATMENT_ACCEPTANCE', 'RISK_TREATMENT_AVOIDANCE', 'RISK_TREATMENT_REDUCTION', 'RISK_TREATMENT_TRANSFER'].map((option) => ({
        text: t(`riskTreatments.${option}`).toString(),
        value: option
      }))
    );

    return {
      treatmentOptions,

      t,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "explanation": "explanation",
    "riskTreatment": "risk treatment",
    "riskTreatments": {
      "RISK_TREATMENT_ACCEPTANCE": "risk retention",
      "RISK_TREATMENT_AVOIDANCE": "risk avoidance",
      "RISK_TREATMENT_REDUCTION": "risk reduction",
      "RISK_TREATMENT_TRANSFER": "risk transfer"
    }
  },
  "de": {
    "explanation": "Erklärung",
    "riskTreatment": "Risikobehandlung",
    "riskTreatments": {
      "RISK_TREATMENT_ACCEPTANCE": "Risikoakzeptanz",
      "RISK_TREATMENT_AVOIDANCE": "Risikovermeidung",
      "RISK_TREATMENT_REDUCTION": "Risikoreduktion",
      "RISK_TREATMENT_TRANSFER": "Risikotransfer"
    }
  }
}
</i18n>


<style lang="scss" scoped>
.veo-risk-dialog__risk-treatment-selection ::v-deep.v-select__selections {
  flex-wrap: nowrap;
}
</style>
