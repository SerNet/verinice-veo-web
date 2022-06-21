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
      {{ upperFirst(t('inherentRisk').toString()) }}
    </h2>
    <VeoCard>
      <v-card-text class="pa-3 px-4">
        <v-row>
          <template v-for="protectionGoal of riskDefinition.categories">
            <VeoInherentRiskSectionColumn
              v-if="protectionGoalExists(protectionGoal.id)"
              :key="protectionGoal.id"
              :protection-goal="protectionGoal"
              :risk-definition="riskDefinition"
              :dirty-fields.sync="dirtyFields"
              v-bind="data.find((riskValue) => riskValue.category === protectionGoal.id)"
            />
          </template>
        </v-row>
      </v-card-text>
    </VeoCard>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { IDirtyFields } from './VeoCreateRiskDialogSingle.vue';
import { IVeoDomainRiskDefinition, IVeoRiskDefinition } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    data: {
      type: Array as PropType<IVeoRiskDefinition['riskValues']>,
      required: true
    },
    riskDefinition: {
      type: Object as PropType<IVeoDomainRiskDefinition>,
      required: true
    },
    dirtyFields: {
      type: Object as PropType<IDirtyFields>,
      default: () => {}
    }
  },
  setup(props) {
    const { t } = useI18n();

    const protectionGoalExists = (protectionGoal: string) => !!props.data.find((riskValue) => riskValue.category === protectionGoal);

    return {
      protectionGoalExists,

      t,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "inherentRisk": "inherent risk"
  },
  "de": {
    "inherentRisk": "Brutto-Risiko"
  }
}
</i18n>
