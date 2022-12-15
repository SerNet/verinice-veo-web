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
  <v-row
    class="mb-2"
    data-component-name="risk-matrix-wrapper"
  >
    <v-col
      v-for="protectionGoal of protectionGoals"
      :key="protectionGoal.id"
      cols="12"
      md="6"
    >
      <VeoCard style="margin-right: 1px">
        <v-card-text>
          <h3
            class="text-h3"
            v-text="protectionGoal.text"
          />
        </v-card-text>
        <VeoRiskMatrix
          v-if="!$fetchState.pending"
          v-bind="getMatrixData(protectionGoal.id)"
        />
        <v-skeleton-loader
          v-else
          type="image"
          width="600px"
        />
      </VeoCard>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch, useRoute } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { cloneDeep, reverse, upperFirst } from 'lodash';

import { IVeoDomain } from '~/types/VeoTypes';
import { separateUUIDParam } from '~/lib/utils';

export const ROUTE_NAME = 'unit-domains-domain-risks-matrix';

export default defineComponent({
  setup() {
    const { $api } = useContext();
    const { t, locale } = useI18n();
    const route = useRoute();

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);
    const riskDefinition = computed(() => route.value.params.matrix);

    const data = ref<undefined | IVeoDomain['riskDefinitions']['x']>(undefined);
    useFetch(async () => {
      data.value = (await $api.domain.fetch(domainId.value)).riskDefinitions[riskDefinition.value];
    });

    // Matrix selection
    const protectionGoals = computed(() =>
      (data.value?.categories || []).map((category) => ({ text: category.translations[locale.value]?.name || Object.values(category.translations)[0].name, id: category.id }))
    );

    // Matrix stuff
    const getMatrixData = (protectionGoal: string) => {
      const category = data.value?.categories.find((category) => category.id === protectionGoal);

      return {
        impacts: reverse(cloneDeep(category?.potentialImpacts || [])),
        value: reverse(cloneDeep(category?.valueMatrix || [])),
        probabilities: data.value?.probability.levels || [],
        riskValues: data.value?.riskValues || []
      };
    };

    return {
      getMatrixData,
      protectionGoals,

      t,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "protectionGoal": "protection goal"
  },
  "de": {
    "protectionGoal": "Schutzziel"
  }
}
</i18n>
