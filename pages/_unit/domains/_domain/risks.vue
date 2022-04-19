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
  <VeoPage :title="upperFirst(t('risks').toString())">
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
              <nuxt-child />
            </v-tab-item>
          </template>
        </VeoTabs>
      </div>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch, useRoute, useRouter } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoDomain } from '~/types/VeoTypes';

export default defineComponent({
  setup() {
    const { $api } = useContext();
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();

    const domain = ref<IVeoDomain | undefined>(undefined);
    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    useFetch(async () => {
      domain.value = await $api.domain.fetch(domainId.value);

      if (!route.value.params.matrix) {
        viewRiskDefinition(Object.values(domain.value.riskDefinitions)[0].id);
      }
    });

    const viewRiskDefinition = (id: string) => {
      router.push({
        name: 'unit-domains-domain-risks-matrix',
        params: {
          ...route.value.params,
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
