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
  <BaseDialog
    :model-value="modelValue"
    v-bind="$attrs"
    :close-disabled="isFetchingUnits"
    :title="isEditMode ? t('editAccessGroup') : t('createAccessGroup')"
    large
    fixed-footer
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
            <BaseTable :items="formData.units" :additional-headers="unitTableHeaders" :loading="isFetchingUnits" />
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
import type {
  IVeoAccessGroup,
  IVeoAccessGroupUnitPermission,
  IVeoCreateAccessGroupParameters,
  IVeoUpdateAccessGroupParameters
} from '~/composables/api/queryDefinitions/accessGroups';
import type { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import { VCheckbox } from 'vuetify/components';

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

const unitTableHeaders = [
  { order: 10, priority: 100, text: t('name').toString(), value: 'name', key: 'name' },
  {
    order: 20,
    priority: 100,
    text: t('read').toString(),
    value: 'read',
    key: 'read',
    align: 'center',
    width: 120,
    render: ({ item }: { item: IVeoAccessGroupUnitPermission }) => {
      return h(VCheckbox, {
        class: 'd-flex justify-center align-center',
        modelValue: item.read,
        disabled: item.write,
        density: 'compact',
        hideDetails: true,
        ripple: false,
        'onUpdate:model-value': (val: boolean) => {
          const unit = formData.value.units.find((u) => u.unitId === item.unitId);
          if (unit) {
            unit.read = val;
            if (!val) unit.write = false;
          }
        }
      });
    }
  },
  {
    order: 30,
    priority: 100,
    text: t('write').toString(),
    value: 'write',
    key: 'write',
    align: 'center',
    width: 120,
    render: ({ item }: { item: IVeoAccessGroupUnitPermission }) => {
      return h(VCheckbox, {
        class: 'd-flex justify-center align-center',
        modelValue: item.write,
        density: 'compact',
        hideDetails: true,
        ripple: false,
        'onUpdate:model-value': (val: boolean) => {
          const unit = formData.value.units.find((u) => u.unitId === item.unitId);
          if (unit) {
            unit.write = val;
            if (val) unit.read = true;
          }
        }
      });
    }
  }
];
</script>

<i18n src="~/locales/base/components/access-group-manage-dialog.json" />
