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
      :value="userDefinedResidualRisk || residualRisk"
      color="primary"
      :label="upperFirst(t('residualRisk').toString())"
      :items="riskValues"
      :disabled="!riskTreatments.length || disabled"
      :clearable="!!(userDefinedResidualRisk && riskTreatments.length)"
      hide-details
      @input="$emit('update:user-defined-residual-risk', $event)"
    >
      <template #selection="{ item }">
        <div class="d-flex justify-space-between fill-width">
          <span>{{ item.text }}</span>
          <v-tooltip
            v-if="userDefinedResidualRisk === undefined && riskTreatments.length"
            top
          >
            <template #activator="{ on }">
              <v-icon
                v-on="on"
              >
                {{ mdiInformationOutline }}
              </v-icon>
            </template>
            <template #default>
              <i18n
                tag="span"
                path="residualRiskHint"
              >
                <br>
              </i18n>
            </template>
          </v-tooltip>
        </div>
      </template>
    </v-select>
    <v-edit-dialog>
      <v-text-field
        :value="residualRiskExplanation"
        :label="upperFirst(t('explanation').toString())"
        :disabled="!riskTreatments.length || disabled"
        hide-details
        @input="$emit('update:residual-risk-explanation', $event)"
      />
      <template #input>
        <v-textarea
          :disabled="!riskTreatments.length || disabled"
          :value="residualRiskExplanation"
          :label="upperFirst(t('explanation').toString())"
          clearable
          auto-grow
          autofocus
          rows="1"
          no-resize
          @input="$emit('update:residual-risk-explanation', $event)"
        />
      </template>
    </v-edit-dialog>
  </v-col>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiInformationOutline } from '@mdi/js';

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
    }
  },
  setup(props) {
    const { t } = useI18n();

    const riskValues = computed(() => props.riskDefinition.riskValues.map((level) => ({ text: level.name, value: level.ordinalValue })));

    return {
      riskValues,

      t,
      upperFirst,
      mdiInformationOutline
    };
  }
});
</script>

<i18n>
{
  "en": {
    "explanation": "explanation",
    "residualRisk": "residual risk",
    "residualRiskHint": "the displayed residual risk has been derived from the input data.{0}You can overwrite it with a custom value"
  },
  "de": {
    "explanation": "Erklärung",
    "residualRisk": "Nettorisiko",
    "residualRiskHint": "Das angezeigte Nettorisiko wurde automatisch berechnet.{0}Sie können es allerdings überschreiben."
  }
}
</i18n>

<style lang="scss" scoped>
::v-deep .v-small-dialog__activator__content {
  width: 100%;
}
</style>
