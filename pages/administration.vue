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
    :title="$t('breadcrumbs.administration')"
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
        <ObjectTable
          :default-headers="['actions']"
          :items="accounts"
          :loading="isFetching"
          :additional-headers="additionalTableHeaders"
        >
          <template #actions="{ item }">
            <div class="d-flex justify-end">
              <v-tooltip
                v-for="action in accountTableActions"
                :key="action.id"
                location="bottom"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :disabled="action.isDisabled && action.isDisabled(item.raw)"
                    :icon="action.icon"
                    variant="text"
                    @click="action.action(item.raw)"
                  />
                </template>
                {{ action.label }}
              </v-tooltip>
            </div>
          </template>
        </ObjectTable>
      </BaseCard>
    </template>
    <template #footer>
      <v-tooltip location="start">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="primary"
            :disabled="
              ability.cannot('manage', 'accounts') ||
                activeAccounts >= userSettings.maxUsers
            "
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

<script lang="ts" setup>
import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { ObjectTableHeader } from '~/components/object/Table.vue';
import { IVeoAccount, useFetchAccounts } from '~/composables/api/accounts';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
const { profile, userSettings } = useVeoUser();
const { ability } = useVeoPermissions();

const { data: accounts, isFetching } = useFetchAccounts();
const activeAccounts = computed(
  () => (accounts.value || []).filter((account) => account.enabled).length
);

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

const manageAccountDialogVisible = computed(
  () => createAccountDialogVisible.value || editAccountDialogVisible.value
);
const manageAccountProps = computed(() =>
  editAccountDialogVisible.value ? editAccountDialogProps.value : {}
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

const additionalTableHeaders = ref<ObjectTableHeader[]>([
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
    render: ({ item }) =>
      item.raw.enabled
        ? $t('global.button.yes').toString()
        : $t('global.button.no').toString()
    ,
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
    value: 'groups',
    key: 'groups'
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
    "accountAdministrationHint": "Jeder Benutzer hat Zugriff auf alle Units und Objekte in diesem Client.",
    "accounts": "Benutzer",
    "activeAccounts": "aktive Benutzer",
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
