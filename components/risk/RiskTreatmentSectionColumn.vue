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
  <v-col cols="6" :md="12 / numOfCols">
    <h3 class="text-h3">
      {{ protectionGoal.translations[locale]?.name }}
    </h3>
    <v-select
      data-test-selector="risk-treatments"
      :model-value="riskTreatments"
      multiple
      color="primary"
      :disabled="disabled"
      :label="upperFirst(t('riskTreatment').toString())"
      :items="treatmentOptions"
      class="veo-risk-dialog__risk-treatment-selection"
      hide-details
      variant="underlined"
      @update:model-value="$emit('update:risk-treatments', $event)"
    >
      <template #selection="{ item, index }">
        <span v-if="index === 0" class="text-no-wrap">
          {{ item.title }}
        </span>
        <!-- @vue-ignore TODO #3066 possibly undefined -->
        <v-chip v-else-if="index === 1" size="small"> +{{ riskTreatments.length - 1 }} {{ t('more') }} </v-chip>
      </template>
    </v-select>
    <v-edit-dialog>
      <template #default="{ props: dialogProps }">
        <v-text-field
          data-test-selector="risk-treatment-explanation-text-field"
          :model-value="riskTreatmentExplanation"
          :disabled="disabled"
          :label="upperFirst(t('explanation').toString())"
          hide-details
          variant="underlined"
          v-bind="dialogProps"
          @update:model-value="$emit('update:risk-treatment-explanation', $event)"
        />
      </template>
      <template #input>
        <v-textarea
          data-test-selector="risk-treatment-explanation-textarea"
          :model-value="riskTreatmentExplanation"
          :disabled="disabled"
          :label="upperFirst(t('explanation').toString())"
          clearable
          auto-grow
          autofocus
          rows="3"
          no-resize
          variant="underlined"
          @update:model-value="$emit('update:risk-treatment-explanation', $event)"
        />
      </template>
    </v-edit-dialog>
  </v-col>
</template>

<script lang="ts">
import { upperFirst } from 'lodash';
import { PropType } from 'vue';

import { IVeoDomainRiskDefinition, IVeoRiskCategory } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
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
    },
    numOfCols: {
      type: Number,
      default: 4
    }
  },
  emits: ['update:risk-treatment-explanation', 'update:risk-treatments'],
  setup() {
    const { t, locale } = useI18n();

    const treatmentOptions = computed(() =>
      [
        'RISK_TREATMENT_ACCEPTANCE',
        'RISK_TREATMENT_AVOIDANCE',
        'RISK_TREATMENT_REDUCTION',
        'RISK_TREATMENT_TRANSFER'
      ].map((option) => ({
        title: t(`riskTreatments.${option}`).toString(),
        value: option
      }))
    );

    return {
      treatmentOptions,

      t,
      locale,
      upperFirst
    };
  }
});
</script>

<i18n src="~/locales/base/components/risk-RiskTreatmentSectionColumn.json"></i18n>

<style lang="scss" scoped>
.veo-risk-dialog__risk-treatment-selection :deep(.v-select__selections) {
  flex-wrap: nowrap;
}

:deep(.v-small-dialog__activator__content) {
  width: 100%;
}
</style>
