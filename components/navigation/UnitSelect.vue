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
  <v-tooltip
    v-if="miniVariant"
    location="bottom"
  >
    <template #activator="{ props: toolTips }">
      <v-icon
        class="ma-4"
        :icon="mdiUnity"
        v-bind="toolTips"
        @click="$emit('expand-menu')"
      />
    </template>

    <template #default>
      {{ t('select') }}
    </template>
  </v-tooltip>

  <v-select
    v-else
    ref="closeMenu"
    :model-value="items"
    class="ma-2 mt-4"
    data-component-name="unit-select"
    :disabled="disabled"
    :items="itemSelection"
    :label="items.length ? t('unit') : t('select')"
  >
    <template #item="{ props, item }">
      <v-list-item
        v-bind="props"
        :active="unitId === item.value"
        color="primary"
        data-veo-test="unit-selection-nav-item"
        width="500"
        :subtitle="item.raw.description"
        :title="item.title"
        :value="item.value"
        @click="unitId = item.value"
      />
    </template>

    <template #append-item>
      <v-divider />

      <v-list-item
        :active="unitId === 'management'"
        color="primary"
        value="management"
        @click="unitId = 'management'; closeMenu.menu = false"
      >
        {{ t('management') }}
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { ROUTE_NAME as ROUTE_DOMAIN_DASHBOARD } from '~/pages/[unit]/domains/[domain]/index.vue';
import { ROUTE_NAME as ROUTE_UNITS } from '~/pages/units/index.vue';

import { useQuery } from '~/composables/api/utils/query';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';

import { mdiUnity } from '@mdi/js';

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
// v-select's append-item slot has no events (!), hence we have to reference it
const closeMenu = ref();

// fetch all client units
const { data: units } = useQuery(unitQueryDefinitions.queries.fetchAll);

const items = computed(() => ((units.value || []).find((unit) => unit.id === route.params.unit))?.name || []);
const itemSelection = computed(() => (units.value || []).map((unit) => ({ value: unit.id, title: unit.name, description: unit.description })));

const unitId = computed({
  get() {
    return route.params.unit as string || 'management';
  },
  set(newValue: string) {
    let params;

    if (newValue === 'management') {
      params = { ...route.params };
    } else {
      const domainId = units.value?.find((unit: any) => unit.id === newValue).domains.find((domain: any) => (domain.id === route.params.domain))?.id || units.value?.find((unit: any) => unit.id === newValue).domains?.[0]?.id;
      params = { unit: newValue, domain: domainId };
    }

    navigateTo({
      name: newValue === 'management' ? ROUTE_UNITS : ROUTE_DOMAIN_DASHBOARD,
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
    "management": "Manage units",
    "select": "Select unit",
    "unit": "Unit"
  },
  "de": {
    "management": "Units verwalten",
    "select": "Unit auswählen",
    "unit": "Unit"
  }
}
</i18n>
