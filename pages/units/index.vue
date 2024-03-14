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
    <LayoutHeadline :title="t('management')" />

    <BaseContainer>
      <h2 class="text-h5 d-flex flex-grow-1 justify-end my-4">
        <strong>Units:&nbsp;</strong>
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
      <v-tooltip location="start">
        <template #activator="{ props }">
          <div v-bind="props" class="veo-primary-action-fab">
            <v-btn
              :disabled="maxUnitsExceeded || ability.cannot('manage', 'units')"
              color="primary"
              :icon="mdiPlus"
              size="large"
              @click="createUnit()"
            />
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

function createUnit() {
  if (!unitsRef.value) return null;
  unitsRef.value.createUnit();
}

useHead({
  title: globalT('breadcrumbs.units')
});
</script>

<i18n>
{
  "en": {
    "active": "active",
    "createUnit": "Create Unit",
    "deleteUnit": "Delete Unit",
    "editUnit": "Edit Unit",
    "exceeded": "You have reached the maximum amount of Units",
    "management": "Unit management",
    "of": "of"
  },
  "de": {
    "active": "aktiv",
    "createUnit": "Unit erstellen",
    "deleteUnit": "Unit löschen",
    "editUnit": "Unit bearbeiten",
    "exceeded": "Sie haben die maximale Anzahl an Units erreicht",
    "management": "Unit-Verwaltung",
    "of": "von"
  }
}
</i18n>
