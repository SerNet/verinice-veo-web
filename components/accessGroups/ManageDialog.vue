<template>
  <BaseDialog
    :model-value="modelValue"
    v-bind="$attrs"
    :close-disabled="isFetchingUnits"
    :title="isEditMode ? t('editAccessGroup') : t('createAccessGroup')"
    large
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <BaseCard>
        <v-card-text>
          <v-form v-model="formIsValid" @submit.prevent="submitGroup">
            <v-text-field
              v-model="formData.name"
              :label="`${t('name')}*`"
              :rules="[requiredRule, nameIsDuplicateRule]"
              variant="underlined"
              class="mb-4"
            />

            <v-card-title class="bg-accent small-caps text-h4 mt-4">
              {{ t('units') }}
            </v-card-title>

            <div v-if="isFetchingUnits" class="text-center pa-4">
              <v-progress-circular indeterminate color="primary" />
            </div>

            <v-data-table
              v-else
              v-model:page="currentPage"
              :headers="tableHeaders"
              :items="formData.units"
              :items-per-page="itemsPerPage"
            >
              <template #item.read="{ item }">
                <v-checkbox
                  :model-value="item.read"
                  :disabled="item.write"
                  density="compact"
                  hide-details
                  :ripple="false"
                  @update:model-value="
                    (val) => {
                      item.read = val;
                      if (!val) item.write = false;
                    }
                  "
                />
              </template>
              <template #item.write="{ item }">
                <v-checkbox
                  :model-value="item.write"
                  density="compact"
                  hide-details
                  class="ma-0 pa-0"
                  :ripple="false"
                  @update:model-value="
                    (val) => {
                      item.write = val;
                      if (val) item.read = true;
                    }
                  "
                />
              </template>
            </v-data-table>
          </v-form>
        </v-card-text>
      </BaseCard>
    </template>

    <template #dialog-options>
      <v-btn :disabled="isFetchingUnits" @click="$emit('update:model-value', false)">
        {{ t('cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        color="primary"
        :disabled="formIsValid === false || !formData.name?.trim()"
        :loading="false"
        @click="submitGroup"
      >
        {{ isEditMode ? t('saveAccessGroup') : t('createAccessGroup') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { trim } from 'lodash';
import { useI18n } from 'vue-i18n';

import type {
  IVeoAccessGroup,
  IVeoAccessGroupUnitPermission,
  IVeoCreateAccessGroupParameters,
  IVeoUpdateAccessGroupParameters
} from '~/composables/api/queryDefinitions/accessGroups';
import type { IVeoUnit } from '~/composables/api/queryDefinitions/units';

const props = defineProps<{
  modelValue: boolean;
  group: IVeoAccessGroup | null;
  accessGroups: IVeoAccessGroup[];
  availableUnits: IVeoUnit[];
  isFetchingUnits: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:model-value', value: boolean): void;
  (e: 'save', group: IVeoCreateAccessGroupParameters | IVeoUpdateAccessGroupParameters): void;
}>();

const { t } = useI18n();

const formIsValid = ref(true);
const currentPage = ref(1);
const itemsPerPage = 10;

const isEditMode = computed(() => !!props.group);

const formData = ref<{
  name: string;
  units: IVeoAccessGroupUnitPermission[];
}>({
  name: '',
  units: []
});

const requiredRule = (v: string) => !!v?.trim() || t('global.input.required').toString();
const nameIsDuplicateRule = (v: string) =>
  !props.accessGroups.find((group) => group.name === trim(v) && group.id !== props.group?.id) ||
  t('nameAlreadyTaken').toString();

const tableHeaders = [
  { text: t('name'), value: 'name' },
  { text: t('read'), value: 'read', align: 'center', width: '120px' },
  { text: t('write'), value: 'write', align: 'center', width: '120px' }
] as any;

watch(
  () => props.group,
  (group) => {
    if (group) {
      formData.value.name = group.name;
      formData.value.units = props.availableUnits.map((unit) => {
        const perm = group.units?.[unit.id];
        return {
          unitId: unit.id,
          name: unit.name,
          read: perm === 'READ_ONLY' || perm === 'READ_WRITE',
          write: perm === 'READ_WRITE'
        };
      });
    } else {
      formData.value.name = '';
      formData.value.units = props.availableUnits.map((unit) => ({
        unitId: unit.id,
        name: unit.name,
        read: false,
        write: false
      }));
    }
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      setTimeout(() => {
        formData.value.name = '';
        formData.value.units = [];
      }, 250);
    }
  }
);

function submitGroup() {
  if (formIsValid.value === false) return;

  const name = trim(formData.value.name);
  if (!name) return;

  const units: Record<string, 'READ_ONLY' | 'READ_WRITE'> = {};
  formData.value.units.forEach(({ unitId, read, write }) => {
    if (read || write) {
      units[unitId] = write ? 'READ_WRITE' : 'READ_ONLY';
    }
  });

  const payload =
    isEditMode.value && props.group ?
      ({ id: props.group.id, name, units } as IVeoUpdateAccessGroupParameters)
    : ({ name, units } as IVeoCreateAccessGroupParameters);

  emit('save', payload);
  emit('update:model-value', false);
}
</script>

<i18n src="~/locales/base/components/access-group-manage-dialog.json" />
