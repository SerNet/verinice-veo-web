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
      {{ protectionGoal.translations[locale].name }}
    </h3>
    <v-select
      data-veo-test="residual-risk"
      :model-value="userDefinedResidualRiskPresent ? userDefinedResidualRisk : residualRisk"
      color="primary"
      :label="upperFirst(t('residualRisk').toString())"
      :items="riskValues"
      :disabled="!riskTreatments.length || disabled"
      :clearable="!!(userDefinedResidualRiskPresent && riskTreatments.length)"
      hide-details
      variant="underlined"
      @update:model-value="emit('update:user-defined-residual-risk', $event)"
    >
      <template #selection="{ item }">
        <div class="d-flex justify-space-between fill-width">
          <span>{{ item.title }}</span>
          <v-tooltip v-if="userDefinedResidualRisk === undefined && riskTreatments.length" top>
            <template #activator="{ props: tooltipProps }">
              <v-icon v-bind="tooltipProps" :icon="mdiInformationOutline" />
            </template>
            <template #default>
              <i18n-t tag="span" keypath="residualRiskHint" scope="global">
                <br />
              </i18n-t>
            </template>
          </v-tooltip>
        </div>
      </template>
    </v-select>
    <v-edit-dialog>
      <template #default="{ props: dialogProps }">
        <v-text-field
          data-veo-test="residual-risk-explanation-text-field"
          :model-value="residualRiskExplanation"
          :label="upperFirst(t('explanation').toString())"
          :disabled="!riskTreatments.length || disabled"
          hide-details
          variant="underlined"
          v-bind="dialogProps"
          :aria-expanded="null"
          @update:model-value="$emit('update:residual-risk-explanation', $event)"
        />
      </template>
      <template #input>
        <v-textarea
          data-veo-test="residual-risk-explanation-textarea"
          :disabled="!riskTreatments.length || disabled"
          :model-value="residualRiskExplanation"
          :label="upperFirst(t('explanation').toString())"
          clearable
          auto-grow
          autofocus
          rows="3"
          no-resize
          variant="underlined"
          @update:model-value="$emit('update:residual-risk-explanation', $event)"
        />
      </template>
    </v-edit-dialog>
  </v-col>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { upperFirst } from 'lodash';
import { mdiInformationOutline } from '@mdi/js';

import type { IVeoDomainRiskDefinition, IVeoRiskCategory } from '~/types/VeoTypes';

const props = defineProps({
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
  userDefinedResidualRisk: {
    type: Number,
    default: undefined
  },
  residualRisk: {
    type: Number,
    default: undefined
  },
  residualRiskExplanation: {
    type: String,
    default: undefined
  },
  numOfCols: {
    type: Number,
    default: 4
  }
});

const emit = defineEmits(['update:residual-risk-explanation', 'update:user-defined-residual-risk']);

const { t, locale } = useI18n();

const userDefinedResidualRiskPresent = computed(() => props.userDefinedResidualRisk !== undefined);

const riskValues = computed(() =>
  props.riskDefinition.riskValues.map((level) => ({
    title: level.translations[locale.value].name,
    value: level.ordinalValue
  }))
);
</script>

<i18n src="~/locales/base/components/risk-risk-residual-section-column.json"></i18n>

<style lang="scss" scoped>
:deep(.v-small-dialog__activator__content) {
  width: 100%;
}
</style>
