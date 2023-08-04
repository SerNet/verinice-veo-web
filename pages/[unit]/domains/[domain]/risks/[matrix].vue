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
    data-component-name="risk-matrix-wrapper"
  >
    <v-col
      v-for="protectionGoal of protectionGoals"
      :key="protectionGoal.id"
      md="6"
    >
      <BaseCard>
        <v-card-title
          class="bg-accent mb-2 small-caps"
        >
          {{ protectionGoal.text }}
        </v-card-title>

        <RiskMatrix
          v-if="!domainIsFetching"
          v-bind="getMatrixData(protectionGoal.id)"
          class="my-2"
        />

        <v-skeleton-loader
          v-else
          type="image"
          width="600px"
        />
      </BaseCard>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { cloneDeep, reverse, upperFirst } from 'lodash';

import domainQueryDefinitions, { IVeoDomain } from '~/composables/api/queryDefinitions/domains';
import { useQuery } from '~~/composables/api/utils/query';
export const ROUTE_NAME = 'unit-domains-domain-risks-matrix';

export default defineComponent({
  setup() {
    const { t, locale } = useI18n();
    const route = useRoute();

    const fetchDomainQueryParameters = computed(() => ({ id: route.params.domain as string }));
    const { data: domain, isFetching: domainIsFetching } = useQuery(domainQueryDefinitions.queries.fetchDomain, fetchDomainQueryParameters);

    const data = computed<undefined | IVeoDomain['riskDefinitions']['x']>(() => domain.value?.riskDefinitions?.[route.params.matrix as string]);
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
      domainIsFetching,
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
