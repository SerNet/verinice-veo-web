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
  <VeoDialog
    v-bind="$attrs"
    :headline="t('deleteAccount')"
    :close-disabled="isLoading"
    v-on="$listeners"
  >
    <template #default>
      <VeoAlert
        :value="profile && profile.username === username"
        flat
        no-close-button
        :type="VeoAlertType.ERROR"
      >
        {{ t('cannotDeleteOwnAccount') }}
      </VeoAlert>
      {{ t('deleteAccountHint') }}
    </template>
    <template #dialog-options>
      <v-btn
        text
        :disabled="isLoading"
        @click="$emit('input', false)"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!id || ability.cannot('manage', 'accounts') || (profile && profile.username === username)"
        :loading="isLoading"
        @click="deleteAccount"
      >
        {{ t('global.button.delete') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { useDeleteAccount } from '~/composables/api/accounts';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';
import { VeoAlertType } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const { ability } = useVeoPermissions();
    const { profile } = useVeoUser();
    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

    const deleteMutationParameters = computed(() => ({ id: props.id }));
    const { mutateAsync: doDelete, isLoading } = useDeleteAccount(deleteMutationParameters);

    const deleteAccount = async () => {
      if (!props.id || ability.value.cannot('manage', 'accounts')) {
        return;
      }
      try {
        await doDelete();
        displaySuccessMessage(t('deletingAccountSuccess').toString());
        emit('success');
        emit('input', false);
      } catch (error: any) {
        displayErrorMessage(t('deletingAccountFailed').toString(), error.message);
      }
    };

    return {
      ability,
      deleteAccount,
      isLoading,
      profile,

      t,
      VeoAlertType
    };
  }
});
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
