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
    <div class="d-flex align-center mb-4">
      <span class="text-body-1 mr-2">
        {{ upperFirst(t('protectionGoal').toString()) }}:
      </span>
      <v-select
        v-model="protectionGoal"
        :items="protectionGoals"
        :loading="$fetchState.pending"
        class="flex-grow-0"
        hide-details
        dense
      />
    </div>
    <VeoRiskMatrix
      v-if="!$fetchState.pending"
      :value="matrixValues"
      :probabilities="probabilities"
      :impacts="impacts"
    />
    <v-skeleton-loader
      v-else
      type="image"
      width="600px"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch, useRoute, useRouter } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { cloneDeep, reverse, upperFirst } from 'lodash';

import { IVeoDomain } from '~/types/VeoTypes';
import { separateUUIDParam } from '~/lib/utils';

export const ROUTE_NAME = 'unit-domains-domain-risks-matrix';

export default defineComponent({
  setup() {
    const { $api } = useContext();
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);
    const riskDefinition = computed(() => route.value.params.matrix);

    const data = ref<undefined | IVeoDomain['riskDefinitions']['x']>(undefined);
    useFetch(async () => {
      data.value = (await $api.domain.fetch(domainId.value)).riskDefinitions[riskDefinition.value];
      protectionGoal.value = data.value.categories[0].id;
    });

    // Matrix selection
    const protectionGoal = computed({
      get() {
        return route.value.query.protectionGoal as string;
      },
      set(newValue: string) {
        router.push({
          params: route.value.params,
          query: {
            protectionGoal: newValue
          }
        });
      }
    });
    const protectionGoals = computed(() => (data.value?.categories || []).map((category) => ({ text: category.name, value: category.id })));

    // Matrix stuff
    const probabilities = computed(() => data.value?.probability.levels || []);
    const currentCategory = computed(() => data.value?.categories.find((category) => category.id === protectionGoal.value));
    const impacts = computed(() => reverse(cloneDeep(currentCategory.value?.potentialImpacts || [])));

    const matrixValues = computed(() => reverse(cloneDeep(currentCategory.value?.valueMatrix || [])));

    return {
      impacts,
      matrixValues,
      probabilities,
      protectionGoal,
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
