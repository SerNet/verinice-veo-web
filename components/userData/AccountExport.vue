<!--
   - verinice.veo web
   - Copyright (C) 2023  jae
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
  <UserDataCard
    :header="t('accountHeader')"
    :download-btn-copy="t('btnDownload')"
    :show-alert="state.showAlert"
    :alert-header="t('alertHeader')"
    :alert-body="t('alertBody')"
    :items="state.accounts"
    :is-loading="state.isLoading"
    :handle-click="exportAccountData"
  />
</template>

<script setup lang="ts">
import { downloadZIP } from "~~/lib/jsonToZip";
import { logError } from './modules/HandleError';
import { useQuerySync } from '~~/composables/api/utils/query';
import accountQueryDefinitions from '~~/composables/api/queryDefinitions/accounts';

// Types
import { IVeoAccount } from "~~/composables/api/queryDefinitions/accounts";

// Composables
const { t } = useI18n();
const { profile, roles } = useVeoUser();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

const state = reactive({
  accounts: [profile.value] as IVeoAccount[],
  showAlert: false,
  isLoading: [] as boolean[]
});

const isAccountManager = computed(() => roles.value.length > 0);

async function exportAccountData(index: number) {
  state.isLoading[index] = true;
  try {
    let accounts = [] as IVeoAccount[];

    if(isAccountManager.value) {
      // Get data on all accounts managed by current account
      accounts = await useQuerySync(accountQueryDefinitions.queries.fetchAccounts);
    }

    // Add current account data
    const currentAccount = state.accounts[0];
    accounts.unshift(currentAccount as IVeoAccount);

    const fileName = `${currentAccount?.username}_accounts`;
    await downloadZIP(accounts, fileName);

    displaySuccessMessage(t('successHeader'));

  } catch (error) {
    state.showAlert = true;
    handleError(error);
  }
  finally {
    state.isLoading[index] = false;
  }
}

function handleError(error: unknown) {
  logError(error);
  displayErrorMessage( t('errorHeader'), t('errorBody'));
}
</script>
<i18n src="./messages.json"></i18n>
