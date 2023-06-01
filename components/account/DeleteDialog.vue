<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
    :title="t('deleteAccount')"
    :close-disabled="isLoading"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <BaseAlert
        :model-value="profile && profile.username === username"
        flat
        no-close-button
        :type="VeoAlertType.ERROR"
      >
        {{ t('cannotDeleteOwnAccount') }}
      </BaseAlert>
      {{ t('deleteAccountHint') }}
    </template>
    <template #dialog-options>
      <v-btn
        text
        :disabled="isLoading"
        @click="$emit('update:model-value', false)"
      >
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!id || ability.cannot('manage', 'accounts') || (profile && profile.username === username)"
        :loading="isLoading"
        @click="deleteAccount"
      >
        {{ globalT('global.button.delete') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import accountQueryDefinitions from '~/composables/api/queryDefinitions/accounts';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';
import { VeoAlertType } from '~/types/VeoTypes';
import { useMutation } from '~~/composables/api/utils/mutation';

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:model-value', 'success']);
  
const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { ability } = useVeoPermissions();
const { profile } = useVeoUser();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

const deleteMutationParameters = computed(() => ({ id: props.id }));
const { mutateAsync: doDelete, isLoading } = useMutation(accountQueryDefinitions.mutations.deleteAccount);

const deleteAccount = async () => {
  if (!props.id || ability.value.cannot('manage', 'accounts')) {
    return;
  }
  try {
    await doDelete(deleteMutationParameters);
    displaySuccessMessage(t('deletingAccountSuccess').toString());
    emit('success');
    emit('update:model-value', false);
  } catch (error: any) {
    displayErrorMessage(t('deletingAccountFailed').toString(), error.message);
  }
};
</script>

<i18n>
{
  "en": {
    "cannotDeleteOwnAccount": "You can't delete your own account!",
    "deleteAccount": "Delete account",
    "deleteAccountHint": "Do you really want to delete this account? This action is not reversible.",
    "deletingAccountFailed": "Couldn't delete account",
    "deletingAccountSuccess": "Account was deleted"

  },
  "de": {
    "cannotDeleteOwnAccount": "Sie können Ihren eigenen Account nicht löschen!",
    "deleteAccount": "Account löschen",
    "deleteAccountHint": "Möchten Sie diesen Account wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    "deletingAccountFailed": "Account konnte nicht gelöscht werden",
    "deletingAccountSuccess": "Account wurde gelöscht"
  }
}
</i18n>
