<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <BaseDialog v-bind="$attrs" :title="t('headline')" @update:model-value="emit('update:model-value', $event)">
    <template #default>
      <span class="text-body-1">
        {{ props.items.length === 1 ? t('singleItem', { displayName }) : t('multipleItems') }}
      </span>
      <div v-if="deletingMultiple" class="progress-container">
        <v-progress-linear :model-value="progress" height="6" color="primary" :aria-label="`${progress}`" />
        <span class="progress-text">{{ progress }}%</span>
      </div>
    </template>
    <template #dialog-options>
      <v-btn variant="text" :disabled="deleting" @click="$emit('update:model-value', false)">
        {{ globalT('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        :disabled="!deleteButtonEnabled || !canManageUnitContent || deleting"
        @click="deleteObjects"
      >
        {{ globalT('global.button.delete') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { useMutation } from '~/composables/api/utils/mutation';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { VeoElementTypePlurals } from '~/types/VeoTypes';
import type { IVeoEntity } from '~/types/VeoTypes';

const props = withDefaults(
  defineProps<{
    items?: IVeoEntity[];
  }>(),
  {
    item: undefined,
    items: undefined
  }
);

const emit = defineEmits<{
  (event: 'update:model-value', value: boolean): void;
  (event: 'error', error: Error): void;
  (event: 'success', multiple: boolean): void;
}>();

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const route = useRoute();
const { ability, subject } = useVeoPermissions();
const { mutateAsync: doDelete } = useMutation(objectQueryDefinitions.mutations.deleteObject);
const { mutateAsync: deleteWithoutInvalidating } = useMutation(
  objectQueryDefinitions.mutations.deleteObject,
  {},
  { isInvalidating: false }
);

const displayName = computed(() => props.items[0]?.displayName ?? '');
const deleteButtonEnabled = computed(() => !!props.items?.length);
const canManageUnitContent = computed(() => ability.value.can('manage', subject('units', { id: route.params.unit })));

const deleting = ref(false);
const deletingMultiple = ref(false);
const progress = ref(0);

const deleteObjects = async () => {
  try {
    deleting.value = true;
    progress.value = 0;

    if (props.items.length === 1) {
      await deleteSingleObject();
      emit('success', false);
    } else if (props.items.length > 1) {
      deletingMultiple.value = true;
      await deleteMultipleObjects();
      emit('success', true);
    }
  } catch (error: any) {
    emit('error', error);
  } finally {
    deleting.value = false;
    deletingMultiple.value = false;
  }
};
const deleteSingleObject = async () => {
  if (!deleteButtonEnabled.value || !canManageUnitContent.value || props.items.length !== 1) return;

  const { type, id } = props.items[0];
  const endpoint = VeoElementTypePlurals[type];

  if (!endpoint) return;

  if (route.params.object) {
    await deleteWithoutInvalidating({ endpoint, id });
  } else {
    await doDelete({ endpoint, id });
  }

  progress.value = 100;
};

const deleteMultipleObjects = async () => {
  if (!deleteButtonEnabled.value || !canManageUnitContent.value || !props.items) return;

  const totalItems = props.items.length;
  let deletedItems = 0;

  for (const item of props.items) {
    const { type, id } = item;
    const endpoint = VeoElementTypePlurals[type];

    if (endpoint) {
      await doDelete({ endpoint, id });
      deletedItems++;
      progress.value = Math.round((deletedItems / totalItems) * 100);
    }
  }
};
</script>
<i18n src="~/locales/base/components/object-delete-dialog.json"></i18n>

<style scoped>
.progress-container {
  margin-top: 16px;
  display: flex;
  align-items: center;
}

.progress-text {
  margin-left: 8px;
  font-size: 14px;
  color: var(--v-theme-primary);
}
</style>
