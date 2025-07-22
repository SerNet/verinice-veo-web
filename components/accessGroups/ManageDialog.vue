<template>
  <v-dialog max-width="600px" persistent :model-value="visible" @update:model-value="$emit('update:visible', $event)">
    <v-card>
      <v-card-title>
        {{ isEditMode ? t('editAccessGroup') : t('createAccessGroup') }}
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="localGroupName" :label="t('name')" variant="outlined" density="compact" required />
        <v-divider class="my-4" />
        <v-card-title class="bg-accent small-caps text-h4">
          <span>{{ t('units') }}</span>
        </v-card-title>

        <div v-if="isFetchingUnits" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary" />
          <p>{{ t('global.message.loading') }}</p>
        </div>

        <v-table v-else density="compact">
          <thead>
            <tr>
              <th>{{ t('name') }}</th>
              <th class="text-center">{{ t('read') }}</th>
              <th class="text-center">{{ t('write') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="unitPermission in localUnitPermissions" :key="unitPermission.unitId">
              <td>{{ unitPermission.name }}</td>

              <td class="text-center pa-0">
                <div class="d-flex justify-center align-center">
                  <v-checkbox
                    :model-value="unitPermission.read"
                    :disabled="unitPermission.write"
                    density="compact"
                    hide-details
                    class="ma-0 pa-0"
                    :ripple="false"
                    @update:model-value="
                      (val) => {
                        unitPermission.read = val;
                        if (!val) unitPermission.write = false;
                      }
                    "
                  />
                </div>
              </td>

              <td class="text-center pa-0">
                <div class="d-flex justify-center align-center">
                  <v-checkbox
                    :model-value="unitPermission.write"
                    density="compact"
                    hide-details
                    class="ma-0 pa-0"
                    :ripple="false"
                    @update:model-value="
                      (val) => {
                        unitPermission.write = val;
                        if (val) unitPermission.read = true;
                      }
                    "
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeDialog">
          {{ t('cancel') }}
        </v-btn>
        <v-btn color="primary" text @click="saveGroup">
          {{ isEditMode ? t('save') : t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { IVeoAccessGroup, IVeoAccessGroupUnitPermission } from '~/composables/api/queryDefinitions/accessGroups';
import { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import { useVeoAlerts } from '~/composables/VeoAlert';
import type {
  IVeoCreateAccessGroupParameters,
  IVeoUpdateAccessGroupParameters
} from '~/composables/api/queryDefinitions/accessGroups';

const { displaySuccessMessage } = useVeoAlerts();

const props = defineProps<{
  visible: boolean;
  group: IVeoAccessGroup | null;
  availableUnits: IVeoUnit[];
  isFetchingUnits: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'save', group: IVeoCreateAccessGroupParameters | IVeoUpdateAccessGroupParameters): void;
}>();

const { t } = useI18n();

const localGroupName = ref('');
const localUnitPermissions = ref<IVeoAccessGroupUnitPermission[]>([]);

const isEditMode = computed(() => !!props.group);

watch(
  () => props.group,
  (newGroup) => {
    if (newGroup) {
      localGroupName.value = newGroup.name;
      localUnitPermissions.value = props.availableUnits.map((unit) => {
        const perm = newGroup.units?.[unit.id];
        return {
          unitId: unit.id,
          name: unit.name,
          read: perm === 'READ_ONLY' || perm === 'READ_WRITE',
          write: perm === 'READ_WRITE'
        };
      });
    } else {
      localGroupName.value = '';
      localUnitPermissions.value = props.availableUnits.map((unit) => ({
        unitId: unit.id,
        name: unit.name,
        read: false,
        write: false
      }));
    }
  },
  { immediate: true }
);

function closeDialog() {
  emit('update:visible', false);
}

function saveGroup() {
  if (!localGroupName.value.trim()) return;

  const unitsPayload: Record<string, 'READ_ONLY' | 'READ_WRITE'> = {};

  localUnitPermissions.value.forEach(({ unitId, read, write }) => {
    if (read || write) {
      unitsPayload[unitId] = write ? 'READ_WRITE' : 'READ_ONLY';
    }
  });

  const name = localGroupName.value.trim();

  if (isEditMode.value && props.group) {
    const payload: IVeoUpdateAccessGroupParameters = {
      id: props.group.id,
      name,
      units: unitsPayload
    };
    emit('save', payload);
  } else {
    const payload: IVeoCreateAccessGroupParameters = {
      name,
      units: unitsPayload
    };
    emit('save', payload);
  }

  closeDialog();
  displaySuccessMessage(t('accessGroupSavedSuccessfully').toString());
}
</script>

<i18n src="~/locales/base/components/access-group-manage-dialog.json"></i18n>
