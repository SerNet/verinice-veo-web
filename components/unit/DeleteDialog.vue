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
      <div>{{ t('question', { name: unit?.name }) }}</div>
      <div>{{ t('hint') }}</div><br>
      <div>{{ t('request') }}</div>

      <BaseCard
        v-if="showUnitConfirmationForm"
        class="mt-4"
      >
        <v-card-title>{{ t('formHeadline') }}</v-card-title>
        <v-form class="mt-4">
          <v-text-field
            v-model="unitName"
            :counter="unit?.name?.length"
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
        variant="outlined"
        color="primary"
        @click="$emit('update:model-value', false); showUnitConfirmationForm = false"
      >
        {{ showUnitConfirmationForm ? t('cancel') : globalT('global.button.no') }}
      </v-btn>

      <v-btn
        v-if="!showUnitConfirmationForm"
        :disabled="showUnitConfirmationForm"
        variant="flat"
        color="green"
        elevation="2"
        to="/user-data"
        @click="showUnitConfirmationForm = false"
      >
        Backup
      </v-btn>
      <v-spacer />

      <v-btn
        v-if="!showUnitConfirmationForm"
        variant="flat"
        elevation="2"
        color="primary"
        :disabled="deletionInProgress || ability.cannot('manage', 'units')"
        :loading="deletionInProgress"
        @click="showUnitConfirmationForm = true"
      >
        {{ globalT('global.button.delete') }}
      </v-btn>

      <v-btn
        v-if="showUnitConfirmationForm"
        :disabled="!unitNameIsValid"
        variant="flat"
        color="primary"
        elevation="2"
        @click="deleteUnit(); showUnitConfirmationForm = false"
      >
        {{ t('buttonCaption') }}
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
  (name: any) => !!name || 'Unit name required'
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
      "buttonCaption": "Delete irrevocably",
      "cancel": "Cancel",
      "dialogTitle": "Delete unit",
      "formHeadline": "Unit Name",
      "hint": "This action cannot be undone.",
      "placeholder": "Please enter the name of the unit to be deleted",
      "question": "Do you really want to irrevocably delete the unit \"{name}\"?",
      "request": "It is recommended to create a local backup of all data before deletion.",
      "unitDeleted": "The unit was deleted successfully."
    },
    "de": {
      "buttonCaption": "Unwiderruflich löschen",
      "cancel": "Abbrechen",
      "dialogTitle": "Unit löschen",
      "formHeadline": "Name der Unit",
      "hint": "Diese Aktion kann nicht rückgängig gemacht werden.",
      "placeholder": "Bitte geben Sie den Namen der zu löschenden Unit ein",
      "question": "Möchten Sie die Unit \"{name}\" wirklich löschen?",
      "request": "Es wird empfohlen, vor der Löschung ein lokales Backup aller Daten anzulegen.",
      "unitDeleted": "Die Unit wurde erfolgreich gelöscht."
    }
  }
  </i18n>
