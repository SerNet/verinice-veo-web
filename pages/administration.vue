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
  <BasePage
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
      <BaseCard>
        <p class="mx-3 mt-3 mb-1">
          <b>{{ activeAccounts }}</b> {{ t('of') }}
          <b>{{ userSettings.maxUsers }}</b> {{ t('activeAccounts') }}
        </p>
        <VeoObjectTable
          :default-headers="['actions']"
          :items="accounts"
          :loading="isFetching"
          :additional-headers="additionalTableHeaders"
        >
          <template #actions="{ item }">
            <v-tooltip
              v-for="action in accountTableActions"
              :key="action.id"
              bottom
            >
              <template #activator="{ props }">
                <v-btn
                  :disabled="action.isDisabled && action.isDisabled(item)"
                  icon
                  v-bind="props"
                  @click="action.action(item)"
                >
                  <!--<v-icon :icon="action.icon" />-->
                </v-btn>
              </template>
              {{ t(action.label) }}
            </v-tooltip>
          </template>
        </VeoObjectTable>
      </BaseCard>
    </template>
    <template #footer>
      <v-tooltip left>
        <template #activator="{ props }">
          <v-btn
            color="primary"
            depressed
            :disabled="
              ability.cannot('manage', 'accounts') ||
                activeAccounts >= userSettings.maxUsers
            "
            fab
            absolute
            style="bottom: 12px; right: 0"
            v-bind="props"
            @click="createAccountDialogVisible = true"
          >
            <!--<v-icon :icon="`mdiSvg:${mdiPlus}`" />-->
          </v-btn>
          <div style="height: 76px" />
        </template>
        <template #default>
          <span>{{ t('createAccount') }}</span>
        </template>
      </v-tooltip>
      <AccountsManageDialog
        v-if="manageAccountDialogVisible"
        :value="manageAccountDialogVisible"
        v-bind="manageAccountProps"
        :existing-accounts="accounts"
        @input="onManageAccountDialogInput"
      />
      <AccountsDeleteDialog
        v-if="deleteAccountDialogVisible"
        v-model="deleteAccountDialogVisible"
        v-bind="editAccountDialogProps"
      />
    </template>
  </BasePage>
</template>

<script lang="ts" setup>
import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { ObjectTableHeader } from '~/components/objects/VeoObjectTable.vue';
import { IVeoAccount, useFetchAccounts } from '~/composables/api/accounts';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';

const { t } = useI18n();
const { profile, userSettings } = useVeoUser();
const { ability } = useVeoPermissions();

const { data: accounts, isFetching } = useFetchAccounts();
const activeAccounts = computed(
  () => (accounts.value || []).filter((account) => account.enabled).length
);

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

const manageAccountDialogVisible = computed(
  () => createAccountDialogVisible.value || editAccountDialogVisible.value
);
const manageAccountProps = computed(() =>
  editAccountDialogVisible.value ? editAccountDialogProps : {}
);
const onManageAccountDialogInput = (newValue: boolean) => {
  if (!newValue) {
    if (createAccountDialogVisible.value) {
      createAccountDialogVisible.value = false;
    } else if (editAccountDialogVisible.value) {
      editAccountDialogVisible.value = false;
    }
  }
};

// Table stuff
const accountTableActions: {
  id: string;
  action: CallableFunction;
  icon: string;
  label: string;
  isDisabled?: CallableFunction;
}[] = [
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
    label: 'global.button.delete',
    isDisabled: (item: IVeoAccount) => item.username === profile.value?.username
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
    render: ({ value }) =>
      value
        ? t('global.button.yes').toString()
        : t('global.button.no').toString(),
    width: 80
  },
  {
    order: 30,
    priority: 80,
    text: t('email').toString(),
    value: 'emailAddress'
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
</script>

<i18n>
{
   "en": {
    "accountAdministrationHint": "Every account has access to all units and objects in this client.",
    "accounts": "Accounts",
    "activeAccounts": "active accounts",
    "createAccount": "Create account",
    "edit": "Edit",
    "email": "Email address",
    "enabled": "Enabled",
    "firstName": "First name",
    "groups": "Assigned groups",
    "lastName": "Last name",
    "of": "of",
    "username": "Username"
   },
   "de": {
    "accountAdministrationHint": "Jeder Account hat Zugriff auf alle Units und Objekte in diesem Client.",
    "accounts": "Accounts",
    "activeAccounts": "aktive Accounts",
    "createAccount": "Account erstellen",
    "edit": "Bearbeiten",
    "email": "E-Mail-Adresse",
    "enabled": "Aktiv",
    "firstName": "Vorname",
    "groups": "Zugehörige Gruppen",
    "lastName": "Nachname",
    "of": "von",
    "username": "Benutzername"
   }
}
</i18n>
