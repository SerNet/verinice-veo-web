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
  <BasePage data-component-name="unit-selection-page" sticky-footer>
    <BaseContainer>
      <h2 class="text-h5 d-flex flex-grow-1 justify-end my-4" data-component-name="number-available-units">
        <span><h1 style="font-size: initial">Units:&nbsp;</h1></span>
        <span>
          {{ activeUnits }} {{ t('of') }} {{ userSettings.maxUnits }}
          {{ t('active') }}
        </span>
      </h2>
    </BaseContainer>

    <BaseContainer>
      <UnitUnits ref="unitsRef" />
    </BaseContainer>

    <template #footer>
      <v-tooltip location="start" :aria-label="t('createUnit')">
        <template #activator="{ props }">
          <div class="d-flex">
            <div class="ml-auto my-6" v-bind="props">
              <v-btn
                data-veo-test="create-unit-btn"
                data-component-name="create-unit-btn"
                to="/units/create"
                :prepend-icon="mdiPlus"
                :disabled="maxUnitsExceeded || ability.cannot('manage', 'units')"
                color="primary"
                size="large"
                :aria-label="t('createUnit')"
                >{{ t('createUnit') }}</v-btn
              >
            </div>
          </div>
        </template>

        <template #default>
          <span v-if="maxUnitsExceeded">
            {{ t('exceeded') }}
          </span>
          <span v-else>
            {{ t('createUnit') }}
          </span>
        </template>
      </v-tooltip>
    </template>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'units';
</script>

<script setup lang="ts">
import { mdiPlus } from '@mdi/js';
import { useVeoUser } from '~/composables/VeoUser';
import { useVeoPermissions } from '~/composables/VeoPermissions';

const { ability } = useVeoPermissions();
const { userSettings } = useVeoUser();
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

const unitsRef = ref<{ createUnit(): () => void; activeUnits: number | null } | null>(null);
const activeUnits = computed(() => unitsRef?.value?.activeUnits || null);
const maxUnitsExceeded = computed(() => (activeUnits?.value || 0) >= userSettings.value.maxUnits);

function _createUnit() {
  if (!unitsRef.value) return null;
  unitsRef.value.createUnit();
}

useHead({
  title: globalT('breadcrumbs.units')
});
</script>

<i18n src="~/locales/base/pages/units-index.json"></i18n>
