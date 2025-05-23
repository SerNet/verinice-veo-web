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
  <!-- @vue-ignore TODO #3066 not assignable -->
  <BaseDialog
    v-bind="$attrs"
    data-veo-test="units-delete-dialog"
    :aria-label="t('dialogTitle')"
    :title="t('dialogTitle')"
    :close-disabled="deletionInProgress"
    :close-function="closeDeleteDialog"
    width="600px"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <div>{{ t('question', { name: unit?.name }) }}</div
      ><br />
      <h2 style="color: #c00000; font-size: unset">
        {{ t('hint') }}
      </h2>
      <BaseAlert
        :model-value="true"
        :buttons="[{ text: 'backup', onClick: navigateToUserData }]"
        title="Backup"
        :type="VeoAlertType.INFO"
        class="mt-4"
        flat
        no-close-button
        to="/user-data"
      >
        {{ t('request') }}
      </BaseAlert>

      <BaseCard class="mt-4">
        <v-form @submit.prevent="deleteUnit">
          <v-text-field
            v-model="unitName"
            autofocus
            hide-details="auto"
            :placeholder="t('placeholder')"
            :rules="nameRules"
            required
            :aria-label="t('unitName')"
            type="input"
          />
        </v-form>
      </BaseCard>
    </template>

    <template #dialog-options>
      <v-btn variant="text" @click="closeDeleteDialog">
        {{ globalT('global.button.cancel') }}
      </v-btn>

      <v-spacer />

      <v-btn
        variant="text"
        color="primary"
        data-veo-test="units-delete-dialog-btn-delete"
        :disabled="unitDeletionDisabled"
        :loading="deletionInProgress"
        @click="deleteUnit"
      >
        {{ globalT('global.button.delete') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import unitQueryDefinitions, { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import { useMutation } from '~/composables/api/utils/mutation';
import { VeoAlertType } from '~/types/VeoTypes';

import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

const props = withDefaults(
  defineProps<{
    unit?: IVeoUnit;
  }>(),
  {
    unit: undefined
  }
);

const emit = defineEmits<{
  (event: 'success'): void;
  (event: 'error'): void;
  (event: 'update:model-value', value: boolean): void;
}>();

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { ability } = useVeoPermissions();

const { mutateAsync: doDelete, isLoading: deletionInProgress } = useMutation(unitQueryDefinitions.mutations.delete);

const unitName = ref('');
const unitNameIsValid = computed(() => unitName.value === props.unit?.name);
const nameRules = [(name: any) => !!name || 'Unit name required'];

const unitDeletionDisabled = computed(
  () => deletionInProgress.value || ability.value.cannot('manage', 'units') || !unitNameIsValid.value
);
const closeDeleteDialog = () => {
  emit('update:model-value', false);
  unitName.value = '';
};

const deleteUnit = async () => {
  if (unitDeletionDisabled.value) {
    return;
  }
  try {
    await doDelete({ id: props.unit?.id });
    // if the unit's to be deleted equals the unit ID in the storage, we delete it from the storage to circumvent a 404 code at login
    const storageUnitId = window.localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_UNIT);

    if (props.unit?.id === storageUnitId) {
      localStorage.removeItem('last-unit');
      localStorage.removeItem('last-domain');
    }

    // if the Demo-Unit is about to be deleted, we have to manipulate the storageKey to ensure, that a profile can be applied again (welcomePage) for another unit created with the same name ("Demo")
    if (props.unit?.name === 'Demo') {
      localStorage.removeItem('demo-unit-profile-applied');
    }

    displaySuccessMessage(t('unitDeleted'));
    emit('success');
  } catch (e: any) {
    emit('error');
    displayErrorMessage(t('unitDeletionError'), e.message);
  } finally {
    closeDeleteDialog();
  }
};

function navigateToUserData() {
  navigateTo('/user-data');
}
</script>

<i18n src="~/locales/base/components/unit-delete-dialog.json"></i18n>
