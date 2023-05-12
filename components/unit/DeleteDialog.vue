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
    :persistent="deletionInProgress"
    :close-disabled="deletionInProgress"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <span class="text-body-1">{{ t('text', { name: unit.name }) }}</span>
    </template>
    <template #dialog-options>
      <v-btn
        text
        @click="$emit('update:model-value', false)"
      >
        {{ globalT('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="deletionInProgress || ability.cannot('manage', 'units')"
        :loading="deletionInProgress"
        @click="deleteUnit"
      >
        {{ globalT('global.button.delete') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

  
import unitQueryDefinitions, { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import { useMutation } from '~~/composables/api/utils/mutation';
  
const props = defineProps({
  unit: {
    type: Object as PropType<IVeoUnit>,
    default: undefined
  }
});
const emit = defineEmits(['success', 'error', 'update:model-value']);
  
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { ability } = useVeoPermissions();

const { mutateAsync: doDelete, isLoading: deletionInProgress } = useMutation(unitQueryDefinitions.mutations.delete);

const deleteUnit = async () => {
  if(deletionInProgress.value || ability.value.cannot('manage', 'units')) {
    return;
  }
  try {
    await doDelete({ id: props.unit.id });
    displaySuccessMessage(t('unitDeleted'));
    emit('success');
    emit('update:model-value', false);
  } catch (e) {
    emit('error');
    displayErrorMessage(t('unitDeletionError'), e.message);
  }
};
</script>
  
  <i18n>
  {
    "en": {
      "deleteUnit": "Delete unit",
      "text": "Do you really want to delete the unit \"{name}\"? This action cannot be undone.",
      "unitDeleted": "The unit was deleted successfully."
    },
    "de": {
      "deleteUnit": "Unit löschen",
      "text": "Möchten Sie die Unit \"{name}\" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
      "unitDeleted": "Die Unit wurde erfolgreich gelöscht."
    }
  }
  </i18n>
