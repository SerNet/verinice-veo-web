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
  <VeoPage
    :title="upperFirst(t('risks').toString())"
    data-component-name="risk-page"
  >
    <template #default>
      <div>
        <p class="pt-3 mb-0 text-body-1">
          {{ t('selectRiskMatrixToView') }}
        </p>
        <VeoTabs>
          <template
            v-if="domain"
            #tabs
          >
            <v-tab
              v-for="riskDefinition of domain.riskDefinitions"
              :key="riskDefinition.id"
              :data-component-name="`risk-definition-${riskDefinition.id}`"
            >
              {{ riskDefinition.id }}
            </v-tab>
          </template>
          <template
            v-else
            #tabs
          >
            <v-tab
              v-for="index in 2"
              :key="index"
              disabled
            >
              <v-skeleton-loader
                height="24px"
                style="border-radius: 999px"
                type="image"
                width="100px"
              />
            </v-tab>
          </template>
          <template #items>
            <v-tab-item>
              <nuxt-page />
            </v-tab-item>
          </template>
        </VeoTabs>
      </div>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { upperFirst } from 'lodash';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoDomain } from '~/types/VeoTypes';
import { useFetchDomain } from '~~/composables/api/domains';

export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();

    const redirectIfNoRiskDefinitionSelected = (data: IVeoDomain) => {
      if (!route.params.matrix) {
        viewRiskDefinition(Object.values(data.riskDefinitions)[0].id);
      }
    };

    const domainId = computed(() => separateUUIDParam(route.params.domain as string).id);
    const fetchDomainQueryParameters = computed(() => ({ id: domainId.value }));
    const { data: domain } = useFetchDomain(fetchDomainQueryParameters, { onSuccess: redirectIfNoRiskDefinitionSelected });
    
    const viewRiskDefinition = (id: string) => {
      router.push({
        name: 'unit-domains-domain-risks-matrix',
        params: {
          ...route.params,
          matrix: id
        }
      });
    };

    return {
      domain,
      viewRiskDefinition,

      t,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "risks": "risk definitions",
    "selectRiskMatrixToView": "Select the risk definition to view."
  },
  "de": {
    "risks": "Risikodefinitionen",
    "selectRiskMatrixToView": "Bite wählen Sie die Risikodefinition aus, die Sie betrachten möchten."
  }
}
</i18n>
