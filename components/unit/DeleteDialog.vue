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
  <BaseDialog
    v-bind="$attrs"
    :title="t('deleteUnit')"
    :close-disabled="deletionInProgress"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <span class="text-body-1">{{ t('text', { name: unit?.name }) }}</span>

      <v-form
        v-if="showUnitConfirmationForm"
        class="mt-4"
      >
        <v-card-subtitle>{{ t('deleteInfo') }}</v-card-subtitle>

        <v-text-field
          v-model="unitName"
          :counter="unit?.name?.length"
          :rules="nameRules"
          label="Unit name"
          required
        />
      </v-form>
    </template>

    <template #dialog-options>
      <v-btn
        variant="text"
        @click="$emit('update:model-value', false); showUnitConfirmationForm = false"
      >
        {{ globalT('global.button.no') }}
      </v-btn>
      <v-spacer />

      <v-btn
        :disabled="showUnitConfirmationForm"
        variant="tonal"
        to="/user-data"
        @click="showUnitConfirmationForm = false"
      >
        Backup
      </v-btn>
      <v-spacer />

      <v-btn
        v-if="!showUnitConfirmationForm"
        variant="text"
        color="primary"
        :disabled="deletionInProgress || ability.cannot('manage', 'units')"
        :loading="deletionInProgress"
        @click="showUnitConfirmationForm = true"
      >
        {{ globalT('global.button.delete') }}
      </v-btn>

      <v-btn
        v-if="showUnitConfirmationForm && unitNameIsValid"
        variant="text"
        color="primary"
        @click="deleteUnit(); showUnitConfirmationForm = false"
      >
        Irrevocably delete
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

import unitQueryDefinitions, { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import { useMutation } from '~~/composables/api/utils/mutation';

const props = defineProps({
  unit: {
    type: Object as PropType<IVeoUnit>,
    default: undefined
  }
});

const emit = defineEmits<{
  (event: 'success'): void
  (event: 'error'): void
  (event: 'update:model-value', value: boolean): void
}>();

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { ability } = useVeoPermissions();

const { mutateAsync: doDelete, isLoading: deletionInProgress } = useMutation(unitQueryDefinitions.mutations.delete);

const showUnitConfirmationForm = ref(false);
const unitName = ref('');
const unitNameIsValid = computed(() => unitName.value === props.unit?.name);
const nameRules = [
  (name: any) => !!name || 'Unit name required',
  (name: any) => (name && name.length === props.unit?.name?.length) || `Unit name must equal ${props.unit?.name?.length} characters`
];

const deleteUnit = async () => {
  if(deletionInProgress.value || ability.value.cannot('manage', 'units')) {
    return;
  }
  try {
    await doDelete({ id: props.unit?.id });
    displaySuccessMessage(t('unitDeleted'));
    emit('success');
    emit('update:model-value', false);
  } catch (e: any) {
    emit('error');
    displayErrorMessage(t('unitDeletionError'), e.message);
  }
};
</script>
  
  <i18n>
  {
    "en": {
      "backup": "Create backup",
      "deleteUnit": "Delete unit",
      "deleteInfo": "Please enter the name of the unit to be deleted:",
      "text": "Do you really want to irrevocably delete the unit \"{name}\"?
      This action cannot be undone.
      It is recommended to create a local backup of all data before deletion.",
      "unitDeleted": "The unit was deleted successfully."
    },
    "de": {
      "backup": "Backup anlegen",
      "deleteUnit": "Unit löschen",
      "deleteInfo": "Bitte geben Sie den Namen der zu löschenden Unit ein:",
      "text": "Möchten Sie die Unit \"{name}\" unwiderruflich löschen?
      Diese Aktion kann nicht rückgängig gemacht werden.
      Es wird empfohlen, vor der Löschung ein lokales Backup aller Daten anzulegen.",
      "unitDeleted": "Die Unit wurde erfolgreich gelöscht."
    }
  }
  </i18n>
