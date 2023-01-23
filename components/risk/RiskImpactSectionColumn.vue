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
      {{ protectionGoal.translations[locale].name }}
    </h3>
    <v-select
      :model-value="potentialImpact"
      color="primary"
      :label="upperFirst(t('potentialImpact').toString())"
      :items="impacts[protectionGoal.id]"
      disabled
      hide-details
    />
    <v-select
      :model-value="specificImpact"
      :disabled="disabled"
      color="primary"
      :label="upperFirst(t('specificImpact').toString())"
      :items="impacts[protectionGoal.id]"
      clearable
      hide-details
      @update:model-value="$emit('update:specific-impact', $event)"
    />
    <v-edit-dialog>
      <v-text-field
        :model-value="specificImpactExplanation"
        :label="upperFirst(t('explanation').toString())"
        :disabled="disabled"
        hide-details
        @update:model-value="$emit('update:specific-impact-explanation', $event)"
      />
      <template #input>
        <v-textarea
          :model-value="specificImpactExplanation"
          :disabled="disabled"
          :label="upperFirst(t('explanation').toString())"
          clearable
          auto-grow
          autofocus
          rows="1"
          no-resize
          @update:model-value="$emit('update:specific-impact-explanation', $event)"
        />
      </template>
    </v-edit-dialog>
    <v-select
      :model-value="effectiveImpact"
      color="primary"
      :label="upperFirst(t('effectiveImpact').toString())"
      :items="impacts[protectionGoal.id]"
      disabled
      hide-details
    >
      <template
        v-if="dirtyFields && dirtyFields[`${riskDefinition.id}_${protectionGoal.id}_specificImpact`]"
        #selection
      >
        {{ t('saveCTA') }}
      </template>
    </v-select>
  </v-col>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { upperFirst } from 'lodash';

import { IDirtyFields } from './CreateDialogSingle.vue';
import { IVeoDomainRiskDefinition, IVeoRisk, IVeoRiskCategory } from '~/types/VeoTypes';

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
    dirtyFields: {
      type: Object as PropType<IDirtyFields>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {}
    },
    potentialImpact: {
      type: Number,
      default: undefined
    },
    specificImpact: {
      type: Number,
      default: undefined
    },
    specificImpactExplanation: {
      type: String,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    effectiveImpact: {
      type: Number,
      default: undefined
    }
  },
  emits: ['update:specific-impact-explanation', 'update:specific-impact'],
  setup(props) {
    const { t, locale } = useI18n();

    const impacts = computed(() =>
      props.riskDefinition.categories.reduce((previousValue: Record<string, any>, currentValue) => {
        previousValue[currentValue.id] = currentValue.potentialImpacts.map((level) => ({ title: level.translations[locale.value].name, value: level.ordinalValue }));
        return previousValue;
      }, {})
    );

    const getImpactValuesByProtectionGoal = (riskDefinition: IVeoRisk['domains']['x']['riskDefinitions']['y'], protectionGoal: string) => {
      return riskDefinition.impactValues.find((value) => value.category === protectionGoal);
    };

    return {
      getImpactValuesByProtectionGoal,
      impacts,

      t,
      locale,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "effectiveImpact": "effective impact",
    "explanation": "explanation",
    "potentialImpact": "potential impact",
    "saveCTA": "save to recompute",
    "specificImpact": "specific impact"
  },
  "de": {
    "effectiveImpact": "Effektive Auswirkung",
    "explanation": "Erklärung",
    "potentialImpact": "potentielle Auswirkung",
    "saveCTA": "Speichern zum Neuberechnen",
    "specificImpact": "spezifische Auswirkungen"
  }
}
</i18n>

<style lang="scss" scoped>
:deep(.v-small-dialog__activator__content) {
  width: 100%;
}
</style>
