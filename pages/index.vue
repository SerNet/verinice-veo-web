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
  <BasePage
    :title="$t('breadcrumbs.index')"
    data-component-name="unit-selection-page"
  >
    <div class="d-flex justify-center">
      <BaseCard
        style="width: 70%; max-width: 1000px;"
      >
        <v-card-text>
          <h3 class="text-h4">
            {{ t('unitpicker') }}
          </h3>
        </v-card-text>
        <v-list
          lines="two"
          data-component-name="unit-selection-available-units"
        >
          <template v-if="unitsFetching">
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
            v-for="unit in units"
            v-else
            :key="unit.id"
            lines="two"
            :title="unit.name"
            :subtitle="unit.description"
            :disabled="!generateUnitDashboardLink(unit.id)"
            :to="generateUnitDashboardLink(unit.id)"
          >
            <template #append>
              <v-tooltip location="bottom">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :icon="mdiTrashCanOutline"
                    variant="text"
                    data-component-name="unit-selection-delete-unit-button"
                    :disabled="unit.name === 'Demo'"
                    @click.prevent="deleteUnit(unit)"
                  />
                </template>
                <template #default>
                  {{ t('deleteUnit') }}
                </template>
              </v-tooltip>
            </template>
          </v-list-item>
        </v-list>
      </BaseCard>
    </div>
    <WelcomeDialog v-model="showWelcomeDialog" />
    <UnitDeleteDialog
      v-model="deleteUnitDialogVisible"
      :unit="unitToDelete"
    />
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'index';
</script>

<script setup lang=ts">
import { StorageSerializers, useStorage } from '@vueuse/core';
import { mdiTrashCanOutline } from '@mdi/js';

import { createUUIDUrlParam, getFirstDomainDomaindId } from '~/lib/utils';
import unitQueryDefinitions, { IVeoUnit} from '~/composables/api/queryDefinitions/units';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import { useQuery } from '~~/composables/api/utils/query';

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

useHead({
  title: $t('breadcrumbs.index')
});

const firstSetpsCompleted = useStorage(LOCAL_STORAGE_KEYS.FIRST_STEPS_COMPLETED, false, localStorage, { serializer: StorageSerializers.boolean });

const showWelcomeDialog = computed({
  get: () => !firstSetpsCompleted.value,
  set: (newValue) => { firstSetpsCompleted.value = !newValue; }
});

const { data: units, isFetching: unitsFetching } = useQuery(unitQueryDefinitions.queries.fetchAll);

const generateUnitDashboardLink = (unitId: string) => {
  const unitToLinkTo = (units.value || []).find((unit) => unit.id === unitId);
  let domainId;

  if (unitToLinkTo) {
    domainId = getFirstDomainDomaindId(unitToLinkTo);
  }

  return unitToLinkTo && domainId ? `/${createUUIDUrlParam('unit', unitToLinkTo.id)}/domains/${createUUIDUrlParam('domain', domainId)}` : undefined;
};


// Unit deletion stuff
const deleteUnitDialogVisible = ref(false);
const unitToDelete = ref<undefined | IVeoUnit>();
const deleteUnit = (unit: IVeoUnit) => {
  unitToDelete.value = unit;
  deleteUnitDialogVisible.value = true;
};
</script>

<i18n>
{
  "en": {
    "deleteUnit": "Delete unit",
    "firstUnitDescription": "This is your first unit",
    "unitpicker": "Please choose a unit",
    "unitpickerPlaceholder": "Search for a unit..."
  },
  "de": {
    "deleteUnit": "Unit löschen",
    "firstUnitDescription": "Dies ist ihre erste Unit",
    "unitpicker": "Bitte wählen Sie eine Unit",
    "unitpickerPlaceholder": "Nach einer Unit suchen..."
  }
}
</i18n>
