<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
<script lang="ts" setup>
import { useFetchUnitDomains } from '~/composables/api/domains';
import { separateUUIDParam, createUUIDUrlParam } from '~/lib/utils';



const route = useRoute();
const unitId = computed(() => separateUUIDParam(route.params.unit as string).id);
const fetchUnitDomainsQueryParameters = computed(() => ({ unitId: unitId.value }));

const {data: allUnitDomains, isFetching: domainsFetching} =  useFetchUnitDomains( fetchUnitDomainsQueryParameters );


const generateDomainDashboardLink = (domainId: string) => {
  return domainId ? `/${route.params.unit}/domains/${createUUIDUrlParam('domain', domainId)}` : undefined;
};

const { t } = useI18n();
</script>
<script lang="ts">
export const ROUTE_NAME = 'index';
</script>

<template>
  <BasePage
    :title="t('domainselector')"
  >
    <div class="d-flex justify-center">
      <BaseCard
        style="width: 70%; max-width: 1000px;"
      >
        <v-card-text>
          <h3 class="text-h4">
            {{ t('domainpicker') }}
          </h3>
        </v-card-text>
        <v-list lines="one">
          <template v-if="domainsFetching">
            <div
              v-for="i in 2"
              :key="i"
              class="mb-4"
            >
              <VSkeletonLoader
                type="text"
                width="150px"
                class="mx-4 my-1"
              />
              <VSkeletonLoader
                type="text"
                width="250px"
                class="mx-4 my-1"
              />
            </div>
          </template>
          <v-list-item
            v-for="item in allUnitDomains"
            :key="item.id"
            :title="item.name"
            :subtitle="item.description"
            :to="generateDomainDashboardLink(item.id)"
          />
        </v-list>
        <v-card-text>
          <div class="text-body-1">
            <p>
              {{ t('furtherDomainInformation') }} 
              <nuxt-link :to="`/${route.params.unit}/domains/more`">
                {{ t('linkMoreInfo') }}
              </nuxt-link>
              {{ t('moreDomainInfo') }}
            </p>
          </div>
        </v-card-text>
      </BaseCard>
    </div>
  </BasePage>
</template>

<i18n>
  {
    "en": {
      "domainpicker": "Please choose a domain",
      "domainpickerPlaceholder": "Search for a domain...",
      "domainselector": "Domain selection",
      "furtherDomainInformation": "The verinice.TEAM will successively provide further domains for verinice.veo click",
      "linkMoreInfo": "here",
      "moreDomainInfo": "for further information."
    },
    "de": {
      "domainpicker": "Bitte wählen Sie eine Domäne",
      "domainpickerPlaceholder": "Nach einer Domäne suchen...",
      "domainselector": "Domänenauswahl",
      "furtherDomainInformation": "Das verinice.TEAM wird sukzessive weitere Domänen für verinice.veo zur Verfügung stellen, klicken Sie",
      "linkMoreInfo": "hier",
      "moreDomainInfo": "für mehr Informationen."

    }
  }
  </i18n>
  
