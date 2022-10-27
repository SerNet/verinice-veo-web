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
  <VeoPage
    :title="t('breadcrumbs.administration')"
    sticky-footer
  >
    <template #default>
      <h2 class="text-h2 mt-6">
        {{ t('accounts') }}
      </h2>
      <p class="text-body-2">
        {{ t('accountAdministrationHint') }}
      </p>
      <VeoCard>
        <VeoObjectTable
          :default-headers="['actions']"
          :items="accounts"
          :loading="isFetching"
          :additional-headers="additionalTableHeaders"
        >
          <template #actions="{item}">
            <v-tooltip
              v-for="action in accountTableActions"
              :key="action.id"
              bottom
            >
              <template #activator="{on}">
                <v-btn
                  icon
                  @click="action.action(item)"
                  v-on="on"
                >
                  <v-icon v-text="action.icon" />
                </v-btn>
              </template>
              {{ t(action.label) }}
            </v-tooltip>
          </template>
        </VeoObjectTable>
      </VeoCard>
    </template>
    <template #footer>
      <v-tooltip left>
        <template
          #activator="{ on }"
        >
          <v-btn
            color="primary"
            depressed
            :disabled="ability.cannot('manage', 'accounts')"
            fab
            absolute
            style="bottom: 12px; right: 0"
            @click="createAccountDialogVisible = true"
            v-on="on"
          >
            <v-icon>
              {{ mdiPlus }}
            </v-icon>
          </v-btn>
          <div style="height: 76px" />
        </template>
        <template #default>
          <span>{{ t('createAccount') }}</span>
        </template>
      </v-tooltip>
      <VeoManageAccountDialog
        v-if="manageAccountDialogVisible"
        :value="manageAccountDialogVisible"
        v-bind="manageAccountProps"
        :taken-account-names="takenAccountNames"
        @input="onManageAccountDialogInput"
      />
      <VeoDeleteAccountDialog
        v-if="deleteAccountDialogVisible"
        v-model="deleteAccountDialogVisible"
        v-bind="editAccountDialogProps"
      />
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { computed, defineComponent, reactive, ref } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { ObjectTableHeader } from '~/components/objects/VeoObjectTable.vue';
import { useFetchAccounts } from '~/composables/api/accounts';
import { usePermissions } from '~/composables/VeoPermissions';
import { IVeoAccount } from '~/plugins/api/account';

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const { data: accounts, isFetching } = useFetchAccounts();
    const ability = usePermissions();

    const onEditAccount = (account: IVeoAccount) => {
      Object.assign(editAccountDialogProps, account);
      editAccountDialogVisible.value = true;
    };

    const onDeleteAccount = (account: IVeoAccount) => {
      Object.assign(editAccountDialogProps, account);
      deleteAccountDialogVisible.value = true;
    };

    const createAccountDialogVisible = ref(false);
    const deleteAccountDialogVisible = ref(false);
    const editAccountDialogVisible = ref(false);
    const editAccountDialogProps = reactive({});

    const manageAccountDialogVisible = computed(() => createAccountDialogVisible.value || editAccountDialogVisible.value);
    const manageAccountProps = computed(() => (editAccountDialogVisible.value ? editAccountDialogProps : {}));
    const onManageAccountDialogInput = (newValue: boolean) => {
      if (!newValue) {
        if (createAccountDialogVisible.value) {
          createAccountDialogVisible.value = false;
        } else if (editAccountDialogVisible.value) {
          editAccountDialogVisible.value = false;
        }
      }
    };

    const takenAccountNames = computed(() => (accounts.value || []).map((account) => account.username));

    // Table stuff
    const accountTableActions: { id: string; action: CallableFunction; icon: string; label: string }[] = [
      {
        id: 'edit',
        action: onEditAccount,
        icon: mdiPencilOutline,
        label: 'edit'
      },
      {
        id: 'delete',
        action: onDeleteAccount,
        icon: mdiTrashCanOutline,
        label: 'global.button.delete'
      }
    ];

    const additionalTableHeaders = ref<ObjectTableHeader[]>([
      {
        order: 10,
        priority: 100,
        text: t('username').toString(),
        value: 'username',
        width: 180
      },
      {
        order: 20,
        priority: 90,
        text: t('enabled').toString(),
        value: 'enabled',
        render: ({ value }) => (value ? t('global.button.yes').toString() : t('global.button.no').toString()),
        width: 80
      },
      {
        order: 30,
        priority: 80,
        text: t('email').toString(),
        value: 'email'
      },
      {
        order: 40,
        priority: 70,
        text: t('firstName').toString(),
        value: 'firstName',
        width: 180
      },
      {
        order: 50,
        priority: 71,
        text: t('lastName').toString(),
        value: 'lastName',
        width: 180
      },
      {
        order: 60,
        priority: 60,
        text: t('groups').toString(),
        value: 'groups'
      }
    ]);

    return {
      ability,
      accounts,
      accountTableActions,
      additionalTableHeaders,
      createAccountDialogVisible,
      deleteAccountDialogVisible,
      editAccountDialogProps,
      isFetching,
      manageAccountDialogVisible,
      manageAccountProps,
      onManageAccountDialogInput,
      takenAccountNames,

      t,
      mdiPlus
    };
  }
});
</script>

<i18n>
{
   "en": {
    "accountAdministrationHint": "Every account has access to all units and objects in this client.",
    "accounts": "Accounts",
    "createAccount": "Create account",
    "edit": "Edit",
    "email": "Email address",
    "enabled": "Enabled",
    "firstName": "First name",
    "groups": "Assigned groups",
    "lastName": "Last name",
    "username": "Username"
   },
   "de": {
    "accountAdministrationHint": "Jeder Account hat Zugriff auf alle Units und Objekte in diesem Client.",
    "accounts": "Accounts",
    "createAccount": "Account erstellen",
    "edit": "Bearbeiten",
    "email": "E-Mail-Adresse",
    "enabled": "Aktiv",
    "firstName": "Vorname",
    "groups": "Zugehörige Gruppen",
    "lastName": "Nachname",
    "username": "Benutzername"
   }
}
</i18n>