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
      :value="potentialImpact"
      color="primary"
      :label="upperFirst(t('potentialImpact').toString())"
      :items="impacts[protectionGoal.id]"
      disabled
      hide-details
    />
    <v-select
      :value="specificImpact"
      color="primary"
      :label="upperFirst(t('specificImpact').toString())"
      :items="impacts[protectionGoal.id]"
      clearable
      hide-details
      @input="$emit('update:specific-impact', $event)"
    />
    <v-edit-dialog>
      <v-text-field
        :value="specificImpactExplanation"
        :label="upperFirst(t('explanation').toString())"
        hide-details
        @input="$emit('update:specific-impact-explanation', $event)"
      />
      <template #input>
        <v-textarea
          :value="specificImpactExplanation"
          :label="upperFirst(t('explanation').toString())"
          clearable
          auto-grow
          autofocus
          rows="1"
          no-resize
          @input="$emit('update:specific-impact-explanation', $event)"
        />
      </template>
    </v-edit-dialog>
    <v-select
      :value="effectiveImpact"
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
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';

import { IDirtyFields } from './VeoCreateRiskDialogSingle.vue';
import { IVeoDomainRiskDefinition, IVeoRisk, IVeoRiskCategory } from '~/types/VeoTypes';
import { IBaseObject } from '~/lib/utils';

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
    effectiveImpact: {
      type: Number,
      default: undefined
    }
  },
  setup(props) {
    const { t } = useI18n();

    const impacts = computed(() =>
      props.riskDefinition.categories.reduce((previousValue: IBaseObject, currentValue) => {
        previousValue[currentValue.id] = currentValue.potentialImpacts.map((level) => ({ text: level.name, value: level.ordinalValue }));
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
::v-deep .v-small-dialog__activator__content {
  width: 100%;
}
</style>
