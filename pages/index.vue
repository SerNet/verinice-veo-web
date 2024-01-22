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
    data-component-name="unit-selection-page"
    sticky-footer
  >
    <LayoutHeadline
      :title="t('management')"
    />

    <div class="d-flex justify-center my-8">
      <BaseCard
        style="width: 70%; max-width: 1000px;"
      >
        <v-card-title class="bg-accent small-caps text-h4">
          <span>Units</span>
          <span style="float: right;">
            {{ activeUnits }} {{ t('of' ) }} {{ userSettings.maxUnits }} {{ t('active') }}
          </span>
        </v-card-title>

        <v-list
          lines="two"
          data-component-name="unit-selection-available-units"
          data-veo-test="unit-selection-available-units"
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
                    :icon="mdiPencilOutline"
                    variant="text"
                    data-component-name="unit-selection-edit-unit-button"
                    @click.prevent="editUnit(unit)"
                  />
                </template>
                <template #default>
                  {{ t('editUnit') }}
                </template>
              </v-tooltip>
              <v-tooltip location="bottom">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :icon="mdiTrashCanOutline"
                    variant="text"
                    data-component-name="unit-selection-delete-unit-button"
                    @click.prevent="deleteUnit(unit)"
                  />
                </template>
                <template #default>
                  {{ t('deleteUnit') }}
                </template>
              </v-tooltip>
            </template>
            <v-divider v-if="units && units?.length > 1" />
          </v-list-item>
        </v-list>
      </BaseCard>
    </div>

    <template #footer>
      <v-tooltip location="start">
        <template #activator="{ props }">
          <div
            v-bind="props"
            class="veo-primary-action-fab"
          >
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

    <UnitManageDialog
      v-model="unitManageDialogVisible"
      :unit-id="unitToEdit"
    />

    <UnitDeleteDialog
      v-model="deleteUnitDialogVisible"
      :unit="unitToDelete"
    />
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'index';
</script>

<script setup lang="ts">
import { mdiTrashCanOutline, mdiPlus, mdiPencilOutline } from '@mdi/js';

import { getFirstDomainDomaindId } from '~/lib/utils';
import { useQuery } from '~/composables/api/utils/query';
import unitQueryDefinitions, { IVeoUnit} from '~/composables/api/queryDefinitions/units';
import { useVeoUser } from '~/composables/VeoUser';
import { useVeoPermissions } from '~/composables/VeoPermissions';

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

const { ability } = useVeoPermissions();
const { userSettings } = useVeoUser();

definePageMeta({
  // middleware: 'welcome-page'
});

useHead({
  title: $t('breadcrumbs.index')
});

const unitManageDialogVisible = ref(false);

function createUnit() {
  unitToEdit.value = undefined;
  unitManageDialogVisible.value = true;
}

const unitToEdit = ref<undefined | string>();
const editUnit = (unit: IVeoUnit) => {
  unitToEdit.value = unit.id;
  unitManageDialogVisible.value = true;
};

const { data: units, isFetching: unitsFetching } = useQuery(unitQueryDefinitions.queries.fetchAll);

const activeUnits = computed(() => units.value?.length || undefined);

const generateUnitDashboardLink = (unitId: string) => {
  const unitToLinkTo = (units.value || []).find((unit) => unit.id === unitId);
  let domainId;

  if (unitToLinkTo) {
    domainId = getFirstDomainDomaindId(unitToLinkTo);
  }

  return unitToLinkTo && domainId ? `/${unitToLinkTo.id}/domains/${domainId}` : undefined;
};

const maxUnitsExceeded = computed(() => (units.value?.length || 0) >= userSettings.value.maxUnits);

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
