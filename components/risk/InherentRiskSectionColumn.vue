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
      data-test-selector="inherent-risk"
      :model-value="inherentRisk"
      color="primary"
      :label="upperFirst(t('inherentRisk').toString())"
      :aria-label="upperFirst(t('inherentRisk'))"
      :items="riskValues"
      disabled
      variant="underlined"
      hide-details
    >
      <template
        v-if="
          dirtyFields &&
          (dirtyFields.scenario ||
            dirtyFields[`${riskDefinition.id}_specificProbability`] ||
            dirtyFields[`${riskDefinition.id}_${protectionGoal.id}_specificImpact`])
        "
        #selection
      >
        {{ t('saveCTA') }}
      </template>
    </v-select>
  </v-col>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { upperFirst } from 'lodash';

import type { IDirtyFields } from './CreateDialogSingle.vue';
import type { IVeoDomainRiskDefinition, IVeoRiskCategory } from '~/types/VeoTypes';

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
    disabled: {
      type: Boolean,
      default: false
    },
    inherentRisk: {
      type: Number,
      default: undefined
    },
    numOfCols: {
      type: Number,
      default: 4
    }
  },
  setup(props) {
    const { t, locale } = useI18n();

    const riskValues = computed(() =>
      props.riskDefinition.riskValues.map((level) => ({
        title: level.translations[locale.value].name,
        value: level.ordinalValue
      }))
    );

    return {
      riskValues,

      t,
      locale,
      upperFirst
    };
  }
});
</script>

<i18n src="~/locales/base/components/risk-inherent-risk-section-column.json"></i18n>
