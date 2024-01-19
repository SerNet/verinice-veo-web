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
  <v-menu
    location="bottom"
    width="275px"
    :transition="false"
    offset="130"
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
          class="veo-unit-select bg-basepage"
          data-component-name="unit-select"
          v-bind="menuProps"
          :disabled="disabled"
        >
          <v-skeleton-loader
            v-if="isFetching"
            height="24px"
            style="border-radius: 999px"
            type="image"
            width="100px"
          />
          <span
            v-else
            class="veo-unit-select__selection text-no-wrap"
          >
            {{ unitName }}
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
                  :icon="mdiUnity"
                />
              </div>
            </template>
            <span>{{ t('management') }}</span>
          </v-tooltip>
        </v-list-item>
      </v-list>
    </template>

    <template #default>
      <v-card>
        <v-list density="compact">
          <v-list-item
            v-for="unit of itemSelection"
            :key="unit.value"
            :active="unitId === unit.value"
            color="primary"
            :value="unit.value"
            :title="unit.title"
            @click="unitId = unit.value"
          />
          <v-divider v-show="!miniVariant" />
          <v-list-item
            :active="unitId === 'management'"
            color="primary"
            data-veo-test="unit-selection-nav-item"
            value="management"
            :title="t('management')"
            @click="unitId = 'management'"
          />
        </v-list>
      </v-card>
    </template>
  </v-menu>
</template>

<script setup lang="ts">
import { ROUTE_NAME as ROUTE_DOMAIN_DASHBOARD } from '~/pages/[unit]/domains/[domain]/index.vue';
import { ROUTE_NAME as ROUTE_INDEX } from '~/pages/index.vue';

import { useQuery } from '~/composables/api/utils/query';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';

import { mdiChevronDown, mdiChevronUp, mdiUnity } from '@mdi/js';

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

// fetch all client units
const { data: units, isFetching } = useQuery(unitQueryDefinitions.queries.fetchAll);

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
      name: newValue === 'management' ? ROUTE_INDEX : ROUTE_DOMAIN_DASHBOARD,
      params: {
        ...params
      }
    });
  }
});

const itemSelection = computed(() => (units.value || []).map((unit: any) => ({ value: unit.id, title: unit.name })));
const unitName = computed(() => units.value?.find((unit: any) => (unitId.value === unit.id))?.name || t('noUnitSelected').toString());
</script>

<i18n>
{
  "en": {
    "management": "Manage units",
    "noUnitSelected": "Select unit"
  },
  "de": {
    "management": "Units verwalten",
    "noUnitSelected": "Unit auswählen"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-unit-select {
  border-radius: 6px;
}

.veo-unit-select.v-list-item--disabled {
  background: rgba(0, 0, 0, 0.16);
}

.veo-unit-select__selection {
  color: #666666;
  font-size: 1.2rem;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
</style>
