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
    <h2 class="text-h2 mb-1">
      {{ upperFirst(t('probability').toString()) }}
    </h2>
    <BaseCard border padding>
      <v-row class="pt-0">
        <v-col xs="12" md="3">
          <v-select
            data-test-selector="risk-potential-probability"
            :model-value="data.potentialProbability"
            color="primary"
            :label="upperFirst(t('potentialProbability').toString())"
            :items="probabilities"
            disabled
            variant="underlined"
            hide-details
          >
            <template v-if="dirtyFields.scenario" #selection>
              {{ t('saveCTA') }}
            </template>
          </v-select>
        </v-col>
        <v-col xs="12" md="3">
          <v-select
            data-test-selector="risk-specific-probability"
            :model-value="data.specificProbability"
            color="primary"
            :disabled="disabled"
            :label="upperFirst(t('specificProbability').toString())"
            :items="probabilities"
            clearable
            hide-details
            variant="underlined"
            @update:model-value="onSpecificProbabilityChanged"
          />
        </v-col>
        <v-col xs="12" md="3">
          <v-select
            data-test-selector="risk-effective-probability"
            :model-value="data.effectiveProbability"
            color="primary"
            :label="upperFirst(t('effectiveProbability').toString())"
            :items="probabilities"
            disabled
            variant="underlined"
            hide-details
          >
            <template
              v-if="dirtyFields && (dirtyFields.scenario || dirtyFields[`${riskDefinition.id}_specificProbability`])"
              #selection
            >
              {{ t('saveCTA') }}
            </template>
          </v-select>
        </v-col>
        <v-col xs="12" md="3">
          <v-edit-dialog>
            <template #default="{ props: dialogProps }">
              <v-text-field
                data-test-selector="risk-probability-explanation-text-field"
                :model-value="data.specificProbabilityExplanation"
                :disabled="disabled"
                :label="upperFirst(t('explanation').toString())"
                hide-details
                variant="underlined"
                v-bind="dialogProps"
                :aria-expanded="null"
                @update:model-value="onSpecificProbabilityExplanationChanged"
              />
            </template>
            <template #input>
              <v-textarea
                data-test-selector="'risk-probability-explanation-textarea'"
                :model-value="data.specificProbabilityExplanation"
                :disabled="disabled"
                :label="upperFirst(t('explanation').toString())"
                clearable
                auto-grow
                autofocus
                rows="3"
                no-resize
                hide-details
                class="pb-1"
                variant="underlined"
                @update:model-value="onSpecificProbabilityExplanationChanged"
              />
            </template>
          </v-edit-dialog>
        </v-col>
      </v-row>
    </BaseCard>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { upperFirst } from 'lodash';

import type { IDirtyFields } from './CreateDialogSingle.vue';
import type { IVeoDomainRiskDefinition, IVeoRiskDefinition } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<IVeoRiskDefinition['probability']>,
      required: true
    },
    riskDefinition: {
      type: Object as PropType<IVeoDomainRiskDefinition>,
      required: true
    },
    dirtyFields: {
      type: Object as PropType<IDirtyFields>,

      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:data', 'update:dirty-fields'],
  setup(props, { emit }) {
    const { t, locale } = useI18n();

    const probabilities = computed(() =>
      props.riskDefinition.probability.levels.map((level) => ({
        title: level.translations[locale.value].name,
        value: level.ordinalValue
      }))
    );

    const onSpecificProbabilityExplanationChanged = (newValue: string) => {
      emit('update:data', {
        ...props.data,
        specificProbabilityExplanation: newValue
      });
    };

    const onSpecificProbabilityChanged = (newValue: number) => {
      emit('update:dirty-fields', {
        ...props.dirtyFields,
        [`${props.riskDefinition.id}_specificProbability`]: true
      });
      emit('update:data', { ...props.data, specificProbability: newValue });
    };

    return {
      onSpecificProbabilityChanged,
      onSpecificProbabilityExplanationChanged,
      probabilities,

      t,
      upperFirst
    };
  }
});
</script>

<i18n src="~/locales/base/components/risk-risk-probability-section.json"></i18n>

<style lang="scss" scoped>
.v-small-dialog__activator :v-deep(*) {
  width: 30px !important;
}
span.v-small-dialog__activator__content :deep(*) {
  width: 30px !important;
}

.v-text-field .v-label {
  max-width: 100% !important;
}
</style>
