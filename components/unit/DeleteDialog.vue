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
    :title="t('dialogTitle')"
    :close-disabled="deletionInProgress"
    width="600px"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <div>{{ t('question', { name: unit?.name }) }}</div><br>
      <div style="color: red;">
        {{ t('hint') }}
      </div>

      <BaseAlert
        :model-value="true"
        :buttons="[{text: 'backup', onClick: () => navigateTo('/user-data')}]"
        :type="VeoAlertType.INFO"
        class="mt-4"
        flat
        no-close-button
        to="/user-data"
      >
        {{ t('request') }}
      </BaseAlert>

      <BaseCard
        class="mt-4"
      >
        <v-form @submit.prevent="deleteUnit">
          <v-text-field
            v-model="unitName"
            autofocus
            hide-details="auto"
            :placeholder="t('placeholder')"
            :rules="nameRules"
            required
            type="input"
          />
        </v-form>
      </BaseCard>
    </template>

    <template #dialog-options>
      <v-btn
        variant="text"
        @click="$emit('update:model-value', false)"
      >
        {{ globalT('global.button.cancel') }}
      </v-btn>

      <v-spacer />

      <v-btn
        variant="text"
        color="primary"
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
import { useMutation } from '~~/composables/api/utils/mutation';
import { VeoAlertType } from '~/types/VeoTypes';

const props = withDefaults(defineProps<{
  unit?: IVeoUnit,
}>(), {
  unit: undefined
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

const unitName = ref('');
const unitNameIsValid = computed(() => unitName.value === props.unit?.name);
const nameRules = [
  (name: any) => !!name || 'Unit name required'
];

const unitDeletionDisabled = computed(() => deletionInProgress.value || ability.value.cannot('manage', 'units') || !unitNameIsValid.value);
const deleteUnit = async () => {
  if (unitDeletionDisabled.value) {
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
      "dialogTitle": "Delete unit",
      "hint": "This action cannot be undone.",
      "placeholder": "Please enter the name of the unit to be deleted",
      "question": "Do you really want to irrevocably delete the unit \"{name}\"?",
      "request": "It is recommended to create a local backup of all data before deletion.",
      "unitDeleted": "The unit was deleted successfully."
    },
    "de": {
      "dialogTitle": "Unit löschen",
      "hint": "Diese Aktion kann nicht rückgängig gemacht werden.",
      "placeholder": "Bitte geben Sie den Namen der zu löschenden Unit ein",
      "question": "Möchten Sie die Unit \"{name}\" wirklich löschen?",
      "request": "Es wird empfohlen, vor der Löschung ein lokales Backup aller Daten anzulegen.",
      "unitDeleted": "Die Unit wurde erfolgreich gelöscht."
    }
  }
  </i18n>
