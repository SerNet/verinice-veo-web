<template>
  <BaseAlert
    v-if="allUnitsAccess"
    :model-value="true"
    :type="VeoAlertType.INFO"
    class="mt-6 mb-4 d-flex align-center"
    no-close-button
    flat
    style="width: max-content"
  >
    <template #default>
      {{ t('allUsersHaveAccessHint') }}
      <v-progress-circular v-if="isLoadingAllUnitsAccess" indeterminate color="primary" size="20" class="ml-2" />
    </template>
  </BaseAlert>
  <!--space added for the button on the bottom-->
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
      :disabled="allUnitsAccess"
      class="mb-2"
      :label="t('grantAllAccessToAllUnits')"
      :model-value="allUnitsAccess"
      @change="setAllUnitsToReadWrite"
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
  IVeoUpdateAccessGroupParameters
} from '~/composables/api/queryDefinitions/accessGroups';
import unitsDefinition, { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import ManageDialog from './ManageDialog.vue';
import DeleteDialog from '~/components/accessGroups/DeleteDialog.vue';
import { VeoAlertType } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';

const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

const isLoadingAllUnitsAccess = ref(false);

const allUnitsAccess = computed(() => {
  if (!accessGroups.value?.length || !availableUnits.value.length) return false;

  return accessGroups.value.every((group) => {
    return availableUnits.value.every((unit) => {
      if (!unit.id) return true;
      return group.units?.[unit.id] === 'READ_WRITE';
    });
  });
});

const setAllUnitsToReadWrite = async () => {
  if (!accessGroups.value?.length || !availableUnits.value.length) return;

  isLoadingAllUnitsAccess.value = true;

  try {
    for (const group of accessGroups.value) {
      const updatedUnits: Record<string, 'READ_WRITE'> = availableUnits.value.reduce(
        (acc, unit) => {
          if (unit.id) acc[unit.id] = 'READ_WRITE';
          return acc;
        },
        {} as Record<string, 'READ_WRITE'>
      );

      await updateAccessGroup({
        id: group.id,
        name: group.name,
        units: updatedUnits
      });
    }

    await refetchAccessGroups();
    displaySuccessMessage(t('successfullyGrantedAllAccess'));
  } catch (error) {
    displayErrorMessage(t('failedToGiveAllAccessToUnits'), JSON.stringify(error));
  } finally {
    isLoadingAllUnitsAccess.value = false;
  }
};

const {
  data: accessGroups,
  isFetching,
  refetch: refetchAccessGroups
} = useQuery(accessGroupsDefinition.queries.fetchAccessGroups);

const { data: unitsData, isFetching: isFetchingUnits } = useQuery(unitsDefinition.queries.fetchAll);
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
