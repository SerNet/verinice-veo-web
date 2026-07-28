<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Philipp Ballhausen, Davit Svandize, Jonas Heitmann
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
  <BasePage data-component-name="unit-selection-page" :title="globalT('breadcrumbs.units')" :has-title-bg="false">
    <div class="toolbar my-4">
      <div class="toolbar-search">
        <v-text-field
          v-model="search"
          data-component-name="unit-search"
          :placeholder="t('search')"
          :aria-label="t('search')"
          :append-inner-icon="mdiMagnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        />
      </div>
      <div v-if="activeUnits !== 0" class="toolbar-right">
        <v-tooltip location="start" :aria-label="t('importUnit')">
          <template #activator="{ props }">
            <span v-bind="props">
              <v-btn
                data-veo-test="import-unit-btn"
                data-component-name="import-unit-btn"
                to="/units/import"
                :prepend-icon="mdiTrayArrowUp"
                :disabled="maxUnitsExceeded || !canCreateUnit"
                color="primary"
                flat
                :aria-label="t('importUnit')"
              >
                {{ t('importUnit') }}
              </v-btn>
            </span>
          </template>

          <template #default>
            <span v-if="maxUnitsExceeded">
              {{ t('exceeded') }}
            </span>
            <span v-else-if="!canCreateUnit">
              {{ t('permissions.missingPermissionTooltip') }}
            </span>
            <span v-else>
              {{ t('importUnitHint') }}
            </span>
          </template>
        </v-tooltip>

        <v-tooltip location="start" :aria-label="t('createUnit')">
          <template #activator="{ props }">
            <span v-bind="props">
              <v-btn
                data-veo-test="create-unit-btn"
                data-component-name="create-unit-btn"
                to="/units/create"
                :prepend-icon="mdiPlus"
                :disabled="maxUnitsExceeded || !canCreateUnit"
                color="primary"
                flat
                :aria-label="t('createUnit')"
              >
                {{ t('createUnit') }}
              </v-btn>
            </span>
          </template>

          <template #default>
            <span v-if="maxUnitsExceeded">
              {{ t('exceeded') }}
            </span>
            <span v-else-if="!canCreateUnit">
              {{ t('permissions.missingPermissionTooltip') }}
            </span>
            <span v-else>
              {{ t('createUnit') }}
            </span>
          </template>
        </v-tooltip>
      </div>
    </div>

    <div class="actions-wrapper mb-2" data-component-name="number-available-units">
      <strong>Units:&nbsp;</strong>
      <span>{{ filteredUnitsCount }} {{ t('of') }} {{ userSettings.maxUnits }} {{ t('active') }}</span>
    </div>

    <UnitUnits ref="unitsRef" :search="search" />
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'units';
</script>

<script setup lang="ts">
import { mdiMagnify, mdiPlus, mdiTrayArrowUp } from '@mdi/js';
import { useVeoUser } from '~/composables/VeoUser';
import { useVeoPermissions } from '~/composables/VeoPermissions';

const { ability } = useVeoPermissions();
const { userSettings } = useVeoUser();
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

const canCreateUnit = computed(() => ability.value.can('create', 'unit'));

const search = ref<string | null>('');
const unitsRef = ref<{
  createUnit(): () => void;
  activeUnits: number | null;
  filteredUnitsCount: number;
} | null>(null);
const activeUnits = computed(() => unitsRef?.value?.activeUnits || 0);
const filteredUnitsCount = computed(() => unitsRef.value?.filteredUnitsCount ?? 0);
const maxUnitsExceeded = computed(() => (activeUnits?.value || 0) >= userSettings.value.maxUnits);

useHead({
  title: globalT('breadcrumbs.units')
});
</script>

<i18n src="~/locales/base/pages/units-index.json"></i18n>

<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  flex-wrap: wrap;
}

.toolbar-search {
  flex: 1;
  min-width: 0;
}

.toolbar-right {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
}

.actions-wrapper {
  display: flex;
  align-items: center;
}

@media (max-width: 600px) {
  .toolbar-search {
    order: 2;
    flex-basis: 100%;
    width: 100%;
  }

  .toolbar-right {
    order: 1;
    width: 100%;
  }
}
</style>
