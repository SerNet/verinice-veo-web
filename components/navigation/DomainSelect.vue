<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Annemarie Bufe
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
  <v-menu
    location="bottom"
    width="275px"
    offset="110"
  >
    <template #activator="{ props: menuProps, isActive }">
      <v-list
        class="mt-4"
        nav
        density="compact"
        :rounded="miniVariant"
      >
        <v-list-item
          v-show="!miniVariant"
          class="veo-domain-select bg-basepage"
          data-component-name="domain-select"
          v-bind="menuProps"
          :disabled="disabled"
        >
          <v-skeleton-loader
            v-if="domainIsFetching"
            height="24px"
            style="border-radius: 999px"
            type="image"
            width="100px"
          />
          <span
            v-else
            class="veo-domain-select__selection text-no-wrap"
          >
            {{ domainName }}
          </span>
          <template #append>
            <v-icon
              color="primary"
              :icon="isActive ? mdiChevronUp : mdiChevronDown"
            />
          </template>
        </v-list-item>
        <v-list-item
          v-show="miniVariant"
          style="height:44px;"
          v-bind="menuProps"
          @click="$emit('expand-menu')"
        >
          <v-tooltip
            location="end"
            :disabled="!miniVariant"
          >
            <template #activator="{ props: tooltip }">
              <div v-bind="tooltip">
                <v-icon
                  color="black"
                  :icon="mdiShapeOutline"
                />
              </div>
            </template>
            <span>{{ t('domainSelection') }}</span>
          </v-tooltip>
        </v-list-item>
      </v-list>
    </template>
    <template #default>
      <v-card>
        <v-list density="compact">
          <v-list-item
            v-for="domain of itemSelection"
            :key="domain.value"
            :active="domainId === domain.value"
            color="primary"
            :value="domain.value"
            :title="domain.title"
            @click="domainId = domain.value"
          />
        </v-list>
      </v-card>
    </template>
  </v-menu>
</template>

<script setup lang="ts">
import { ROUTE_NAME as ROUTE_MORE_DOMAINS } from '~/pages/[unit]/domains/more.vue';
import { ROUTE_NAME as ROUTE_DOMAIN_DASHBOARD } from '~/pages/[unit]/domains/[domain]/index.vue';
import { useFetchUnitDomains } from '~/composables/api/domains';

import { mdiChevronDown, mdiChevronUp, mdiShapeOutline } from '@mdi/js';

withDefaults(defineProps<{
  disabled?: boolean,
  miniVariant: boolean
}>(), {
  disabled: false,
  miniVariant: false
});

defineEmits<{
  (event: 'expand-menu'): void;
}>();

const route = useRoute();
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

const domainId = computed({
  get() {
    return route.params.domain as string || 'more';
  },
  set(newValue: string) {
    const params = newValue === 'more'
      ? { ...route.params }
      : { domain: newValue };

    navigateTo({
      name: newValue === 'more' ? ROUTE_MORE_DOMAINS : ROUTE_DOMAIN_DASHBOARD,
      params: {
        ...params
      }
    });
  }
});

const domainName = computed(() => itemSelection.value.find((domain: any) => domain.value === domainId.value)?.title || t('noDomainSelected').toString());

const fetchUnitDomainsQueryParameters = computed(() => ({ unitId: route.params.unit as string }));
const fetchUnitDomainsQueryEnabled = computed(() => !!route.params.unit);
const { data: domains, isFetching: domainIsFetching } = useFetchUnitDomains(fetchUnitDomainsQueryParameters, { enabled: fetchUnitDomainsQueryEnabled });

const itemSelection = computed(() => (domains.value || []).map((domain: any) => ({ value: domain.id, title: domain.name })).concat({ value: 'more', title: globalT('breadcrumbs.more').toString() }));
</script>

<i18n>
{
  "en": {
    "noDomainSelected": "No domain selected",
    "domainSelection": "Domain selection"
  },
  "de": {
    "noDomainSelected": "Keine Domäne ausgewählt",
    "domainSelection": "Domänenauswahl"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-domain-select {
  border-radius: 6px;
}

.veo-domain-select.v-list-item--disabled {
  background: rgba(0, 0, 0, 0.16);
}

.veo-domain-select__selection {
  color: #666666;
  font-size: 1.2rem;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
</style>
