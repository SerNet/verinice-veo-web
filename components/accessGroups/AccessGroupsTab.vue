<!--
   - verinice.veo web
   - Copyright (C) 2025  Djordje Mirosavljevic
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
  <BaseCard class="mb-16">
    <v-card-title class="bg-accent small-caps text-h4 d-flex justify-space-between align-center">
      <span>{{ t('accessGroups') }}</span>
    </v-card-title>
    <v-tooltip location="start">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          class="veo-primary-action-fab"
          color="primary"
          size="large"
          :icon="mdiPlus"
          :aria-label="t('createAccessGroup')"
          @click="openCreateDialog"
        />
      </template>
      <span>{{ t('createAccessGroup') }}</span>
    </v-tooltip>
    <v-checkbox
      class="mb-2"
      :disabled="isLoadingAccess"
      :label="t('grantAllAccessToAllUnits')"
      :model-value="allUnitsHaveAccess"
      @change="toggleAllUnitsAccess"
    />

    <BaseTable
      :default-headers="['actions']"
      :items="accessGroups"
      :loading="isFetching"
      :additional-headers="accessGroupTableHeaders"
    >
      <template #actions="{ item }">
        <div class="d-flex justify-end">
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :disabled="allUnitsHaveAccess"
                :icon="mdiPencilOutline"
                variant="text"
                :aria-label="t('edit')"
                @click="openEditDialog(item)"
              />
            </template>
            {{ t('edit') }}
          </v-tooltip>

          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="mdiTrashCanOutline"
                variant="text"
                :aria-label="$t('global.button.delete')"
                @click="openDeleteDialog(item)"
              />
            </template>
            {{ $t('global.button.delete') }}
          </v-tooltip>
        </div>
      </template>
    </BaseTable>
  </BaseCard>

  <ManageDialog
    v-model="createEditDialogVisible"
    :group="editAccessGroupDialogProps"
    :access-groups="accessGroups"
    :available-units="unitsData"
    :is-fetching-units="isFetchingUnits"
    @save="onSaveAccessGroup"
  />

  <DeleteDialog
    v-model:visible="deleteAccessGroupDialogVisible"
    :group="groupToDelete"
    @confirm="confirmDeleteAccessGroup"
  />
</template>

<script setup lang="ts">
import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { useQuery } from '~/composables/api/utils/query';
import { useMutation } from '~/composables/api/utils/mutation';
import accessGroupsDefinition, {
  IVeoAccessGroup,
  IVeoCreateAccessGroupParameters,
  IVeoUpdateAccessGroupParameters,
  IVeoRestrictUnitAccessParameters
} from '~/composables/api/queryDefinitions/accessGroups';
import unitsDefinition, { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import ManageDialog from './ManageDialog.vue';
import DeleteDialog from '~/components/accessGroups/DeleteDialog.vue';
import { useVeoAlerts } from '~/composables/VeoAlert';

const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

const {
  data: accessGroups,
  isFetching,
  refetch: refetchAccessGroups
} = useQuery(accessGroupsDefinition.queries.fetchAccessGroups);

const { data: unitsData, isFetching: isFetchingUnits } = useQuery(unitsDefinition.queries.fetchAll);
const { data: isRestrictedAccess } = useQuery(accessGroupsDefinition.queries.isRestrictUnitAccess);

const { mutateAsync: updateRestrictUnitAccess, isLoading: isLoadingAccess } = useMutation<
  IVeoRestrictUnitAccessParameters,
  void
>(accessGroupsDefinition.mutations.updateRestrictUnitAccess);

const allUnitsHaveAccess = ref(false);

watchEffect(() => {
  const val = isRestrictedAccess.value;
  allUnitsHaveAccess.value = val ? !val.restrictUnitAccess : false;
});

async function toggleAllUnitsAccess() {
  const newValue = !allUnitsHaveAccess.value;
  await updateRestrictUnitAccess({ restrictUnitAccess: !newValue });
  allUnitsHaveAccess.value = newValue;
  if (newValue) {
    displaySuccessMessage(t('successfullyGrantedAllAccess'));
  }
}

const availableUnits = ref<Partial<IVeoUnit>[]>([]);
watch(
  unitsData,
  (units) => {
    availableUnits.value = units?.map((unit) => ({ id: unit.id, name: unit.name })) || [];
  },
  { immediate: true }
);

const createEditDialogVisible = ref(false);
const editAccessGroupDialogProps = ref<IVeoAccessGroup | null>(null);
const deleteAccessGroupDialogVisible = ref(false);
const groupToDelete = ref<IVeoAccessGroup | null>(null);

function openCreateDialog() {
  editAccessGroupDialogProps.value = null;
  createEditDialogVisible.value = true;
}

function openEditDialog(group: IVeoAccessGroup) {
  editAccessGroupDialogProps.value = group;
  createEditDialogVisible.value = true;
}

function openDeleteDialog(group: IVeoAccessGroup) {
  groupToDelete.value = group;
  deleteAccessGroupDialogVisible.value = true;
}

const { mutateAsync: createAccessGroup } = useMutation(accessGroupsDefinition.mutations.createAccessGroup);
const { mutateAsync: updateAccessGroup } = useMutation(accessGroupsDefinition.mutations.updateAccessGroup);
const { mutateAsync: deleteAccessGroup } = useMutation(accessGroupsDefinition.mutations.deleteAccessGroup);

async function onSaveAccessGroup(payload: IVeoCreateAccessGroupParameters | IVeoUpdateAccessGroupParameters) {
  try {
    if ('id' in payload) {
      await updateAccessGroup(payload);
      displaySuccessMessage(t('successfullyUpdatedAccessGroup'));
    } else {
      await createAccessGroup(payload);
      displaySuccessMessage(t('successfullyCreatedAccessGroup'));
    }
    createEditDialogVisible.value = false;
    refetchAccessGroups();
  } catch (e) {
    console.error('Error saving access group', e);
    displayErrorMessage(t('failedToSaveAccessGroup'), JSON.stringify(e));
  }
}

async function confirmDeleteAccessGroup() {
  if (!groupToDelete.value?.id) return;

  try {
    await deleteAccessGroup({ id: groupToDelete.value.id });
    deleteAccessGroupDialogVisible.value = false;
    groupToDelete.value = null;
    await refetchAccessGroups();
    displaySuccessMessage(t('successfullyDeletedAccessGroup'));
  } catch (e) {
    console.error('Error deleting access group', e);
    displayErrorMessage(t('failedToDeleteAccessGroup'), JSON.stringify(e));
  }
}

const accessGroupTableHeaders = [
  {
    order: 10,
    priority: 100,
    text: t('name').toString(),
    value: 'name',
    key: 'name'
  }
];
</script>

<i18n src="~/locales/base/pages/administration.json"></i18n>

<style lang="scss" scoped>
.veo-primary-action-fab {
  position: fixed !important;
  bottom: 24px;
  right: 24px;
  border-radius: 50%;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
