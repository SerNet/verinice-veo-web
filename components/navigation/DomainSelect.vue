<!--
   - verinice.veo web
   - Copyright (C) 2024 Frank Schneider
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
  <v-tooltip v-if="miniVariant" location="bottom">
    <template #activator="{ props: toolTips }">
      <v-icon class="ma-4" :icon="mdiPuzzle" v-bind="toolTips" @click="$emit('expand-menu')" />
    </template>

    <template #default>
      {{ t('select') }}
    </template>
  </v-tooltip>

  <v-autocomplete
    v-else
    ref="closeMenu"
    :model-value="items"
    class="mx-2"
    data-component-name="domain-select"
    density="compact"
    :disabled="disabled"
    :items="itemSelection"
    :label="items.length ? t('domain') : t('select')"
    data-veo-test="domain-select"
  >
    <template #item="{ props, item }">
      <v-list-item
        v-show="!miniVariant"
        v-bind="props"
        :active="domainId === item.value"
        color="primary"
        data-veo-test="domain-selection-nav-item"
        width="500"
        :title="item.title"
        :value="item.value"
        @click="domainId = item.value"
      />
    </template>

    <template #append-item>
      <v-divider />

      <v-list-item
        :active="domainId === 'more'"
        color="primary"
        value="more"
        :title="globalT('breadcrumbs.more')"
        @click="
          domainId = 'more';
          closeMenu.menu = false;
        "
      />
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { ROUTE_NAME as ROUTE_MORE_DOMAINS } from '~/pages/[unit]/domains/more.vue';
import { ROUTE_NAME as ROUTE_DOMAIN_DASHBOARD } from '~/pages/[unit]/domains/[domain]/index.vue';

import { useFetchUnitDomains } from '~/composables/api/domains';

import { mdiPuzzle } from '@mdi/js';

withDefaults(
  defineProps<{
    disabled?: boolean;
    miniVariant?: boolean;
  }>(),
  {
    disabled: false,
    miniVariant: false
  }
);

defineEmits<{
  (event: 'expand-menu'): void;
}>();

const route = useRoute();
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

const fetchUnitDomainsQueryParameters = computed(() => ({
  unitId: route.params.unit as string
}));
const fetchUnitDomainsQueryEnabled = computed(() => !!route.params.unit);
const { data: domains } = useFetchUnitDomains(fetchUnitDomainsQueryParameters, {
  enabled: fetchUnitDomainsQueryEnabled
});

// v-select's append-item slot has no events (!), hence we have to reference it
const closeMenu = ref();

const items = computed(
  () => (domains.value || []).find((domain: any) => domain.id === route.params.domain)?.name || []
);
const itemSelection = computed(() =>
  (domains.value || []).map((domain: any) => ({
    value: domain.id,
    title: domain.name
  }))
);

const domainId = computed({
  get() {
    return (route.params.domain as string) || 'more';
  },
  set(newValue: string) {
    const params = newValue === 'more' ? { unit: route.params.unit } : { domain: newValue };

    navigateTo({
      name: newValue === 'more' ? ROUTE_MORE_DOMAINS : ROUTE_DOMAIN_DASHBOARD,
      params: {
        ...params
      }
    });
  }
});
</script>

<i18n>
{
  "en": {
    "domain": "Domain",
    "select": "Select domain"
  },
  "de": {
    "domain": "Domäne",
    "select": "Domäne auswählen"
  }
}
</i18n>
