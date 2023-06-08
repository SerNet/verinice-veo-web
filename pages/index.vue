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
    sticky-footer
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

    <template #footer>
      <v-tooltip location="start">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="veo-primary-action-fab"
            color="primary"
            :disabled="false"
            :icon="mdiPlus"
            size="large"
            @click="createUnit()"
          />
          <div style="height: 76px" />
        </template>

        <template #default>
          <span>{{ t('createUnit') }}</span>
        </template>
      </v-tooltip>
    </template>

    <UnitManageDialog v-model="unitManageDialogVisible" />

    <UnitDeleteDialog
      v-model="deleteUnitDialogVisible"
      :unit="unitToDelete"
    />

    <WelcomeDialog v-model="showWelcomeDialog" />
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'index';
</script>

<script lang="ts" setup>
import { StorageSerializers, useStorage } from '@vueuse/core';
import { mdiTrashCanOutline, mdiPlus } from '@mdi/js';

import { createUUIDUrlParam, getFirstDomainDomaindId } from '~/lib/utils';
import { useQuery } from '~~/composables/api/utils/query';
import unitQueryDefinitions, { IVeoUnit} from '~/composables/api/queryDefinitions/units';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

useHead({
  title: $t('breadcrumbs.index')
});

const firstStepsCompleted = useStorage(LOCAL_STORAGE_KEYS.FIRST_STEPS_COMPLETED, false, localStorage, { serializer: StorageSerializers.boolean });

const showWelcomeDialog = computed({
  get: () => !firstStepsCompleted.value,
  set: (newValue) => { firstStepsCompleted.value = !newValue; }
});

const unitManageDialogVisible = ref(false);

function createUnit() {
  unitManageDialogVisible.value = true;
}

const { data: units, isFetching: unitsFetching } = useQuery(unitQueryDefinitions.queries.fetchAll);

const generateUnitDashboardLink = (unitId: string) => {
  const unitToLinkTo = (units.value || []).find((unit) => unit.id === unitId);
  let domainId;

  if (unitToLinkTo) {
    domainId = getFirstDomainDomaindId(unitToLinkTo);
  }

  return unitToLinkTo && domainId
    ? `/${createUUIDUrlParam('unit', unitToLinkTo.id)}/domains/${createUUIDUrlParam('domain', domainId)}`
    : undefined;
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
    "createUnit": "Create unit",
    "deleteUnit": "Delete unit",
    "unitpicker": "Please choose a unit",
  },
  "de": {
    "createUnit": "Unit erstellen",
    "deleteUnit": "Unit löschen",
    "unitpicker": "Bitte wählen Sie eine Unit",
  }
}
</i18n>
