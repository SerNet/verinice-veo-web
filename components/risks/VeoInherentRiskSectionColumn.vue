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
      :value="inherentRisk"
      color="primary"
      :label="upperFirst(t('inherentRisk').toString())"
      :items="riskValues"
      disabled
      hide-details
    >
      <template
        v-if="dirtyFields && (dirtyFields.scenario || dirtyFields[`${riskDefinition.id}_specificProbability`] || dirtyFields[`${riskDefinition.id}_${protectionGoal.id}_specificImpact`])"
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
    dirtyFields: {
      type: Object as PropType<IDirtyFields>,
      default: () => {}
    },
    inherentRisk: {
      type: Number,
      default: undefined
    }
  },
  setup(props) {
    const { t } = useI18n();

    const riskValues = computed(() => props.riskDefinition.riskValues.map((level) => ({ text: level.name, value: level.ordinalValue })));

    return {
      riskValues,

      t,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "inherentRisk": "inherent risk",
    "saveCTA": "save to recompute"
  },
  "de": {
    "inherentRisk": "Brutto-Risiko",
    "saveCTA": "Speichern zum Neuberechnen"
  }
}
</i18n>
