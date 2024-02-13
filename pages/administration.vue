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
  <BasePage sticky-footer>
    <template #default>
      <LayoutHeadline :title="$t('breadcrumbs.administration')" />

      <BaseAlert
        :model-value="true"
        class="mt-8 mb-4"
        flat
        no-close-button
        :title="t('access')"
        :type="VeoAlertType.INFO"
        style="width: max-content"
      >
        {{ t('accountAdministrationHint') }}
      </BaseAlert>

      <BaseCard>
        <v-card-title class="bg-accent small-caps text-h4">
          <span>{{ t('accounts') }}</span>
          <span style="float: right">
            <b>{{ activeAccounts }}</b> {{ t('of') }} <b>{{ userSettings.maxUsers - 1 }}</b> {{ t('activeAccounts') }}
          </span>
        </v-card-title>

        <BaseTable
          :default-headers="['actions']"
          :items="accounts"
          :loading="isFetching"
          :additional-headers="additionalTableHeaders"
        >
          <template #actions="{ item }">
            <div class="d-flex justify-end">
              <v-tooltip v-for="action in accountTableActions" :key="action.id" location="bottom">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :disabled="action.isDisabled && action.isDisabled(item)"
                    :icon="action.icon"
                    variant="text"
                    @click="action.action(item)"
                  />
                </template>
                {{ action.label }}
              </v-tooltip>
            </div>
          </template>
        </BaseTable>
      </BaseCard>
    </template>
    <template #footer>
      <v-tooltip location="start">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="primary"
            :disabled="ability.cannot('manage', 'accounts') || activeAccounts >= userSettings.maxUsers - 1"
            size="large"
            class="veo-primary-action-fab"
            :icon="mdiPlus"
            @click="createAccountDialogVisible = true"
          />
          <div style="height: 76px" />
        </template>
        <template #default>
          <span>{{ t('createAccount') }}</span>
        </template>
      </v-tooltip>
      <AccountManageDialog
        v-if="manageAccountDialogVisible"
        :model-value="manageAccountDialogVisible"
        v-bind="manageAccountProps"
        :existing-accounts="accounts"
        @update:model-value="onManageAccountDialogInput"
      />
      <AccountDeleteDialog
        v-if="deleteAccountDialogVisible"
        v-model="deleteAccountDialogVisible"
        v-bind="deleteAccountDialogProps"
      />
    </template>
  </BasePage>
</template>

<script setup lang="ts">
import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { TableHeader } from '~/components/base/Table.vue';
import accountQueryDefinition, { IVeoAccount } from '~/composables/api/queryDefinitions/accounts';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';
import { useQuery } from '~/composables/api/utils/query';
import { VeoAlertType } from '~/types/VeoTypes';

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
const { profile, userSettings } = useVeoUser();
const { ability } = useVeoPermissions();

const { data: accounts, isFetching } = useQuery(accountQueryDefinition.queries.fetchAccounts);
const activeAccounts = computed(() => (accounts.value || []).filter((account) => account.enabled).length);

const onEditAccount = (data: any) => {
  editAccountDialogProps.value = data;
  editAccountDialogVisible.value = true;
};

const onDeleteAccount = (data: any) => {
  deleteAccountDialogProps.value = data;
  deleteAccountDialogVisible.value = true;
};

const createAccountDialogVisible = ref(false);
const deleteAccountDialogVisible = ref(false);
const deleteAccountDialogProps = ref<Record<string, any>>({});
const editAccountDialogVisible = ref(false);
const editAccountDialogProps = ref<Record<string, any>>({});

const manageAccountDialogVisible = computed(() => createAccountDialogVisible.value || editAccountDialogVisible.value);
const manageAccountProps = computed(() =>
  editAccountDialogVisible.value ? editAccountDialogProps.value : { groups: ['veo-write-access'] }
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
    label: t('edit')
  },
  {
    id: 'delete',
    action: onDeleteAccount,
    icon: mdiTrashCanOutline,
    label: $t('global.button.delete'),
    isDisabled: (item: IVeoAccount) => item.username === profile.value?.username
  }
];

const additionalTableHeaders = ref<TableHeader[]>([
  {
    order: 10,
    priority: 100,
    text: t('username').toString(),
    value: 'username',
    key: 'username',
    width: 180
  },
  {
    order: 20,
    priority: 90,
    text: t('enabled').toString(),
    value: 'enabled',
    key: 'enabled',
    render: ({ internalItem: item }) =>
      item.raw.enabled ? $t('global.button.yes').toString() : $t('global.button.no').toString(),
    width: 80
  },
  {
    order: 30,
    priority: 80,
    text: t('email').toString(),
    value: 'emailAddress',
    key: 'emailAddress'
  },
  {
    order: 40,
    priority: 70,
    text: t('firstName').toString(),
    value: 'firstName',
    key: 'firstName',
    width: 180
  },
  {
    order: 50,
    priority: 71,
    text: t('lastName').toString(),
    value: 'lastName',
    key: 'lastName',
    width: 180
  },
  {
    order: 60,
    priority: 60,
    text: t('groups').toString(),
    render: ({ internalItem: item }) => item.raw.groups.join(', '),
    value: 'groups',
    key: 'groups'
  }
]);
</script>

<i18n>
{
   "en": {
    "access": "Access",
    "accounts": "Accounts",
    "accountAdministrationHint": "Every account has access to all units and objects in this client.",
    "activeAccounts": "active",
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
    "access": "Zugriff",
    "accounts": "Benutzer",
    "accountAdministrationHint": "Jeder Benutzer hat Zugriff auf alle Units und Objekte in diesem Client.",
    "activeAccounts": "aktiv",
    "createAccount": "Benutzer erstellen",
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
