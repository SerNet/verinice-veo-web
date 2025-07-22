<template>
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
                :aria-label="action.label"
                @click="action.action(item)"
              />
            </template>
            {{ action.label }}
          </v-tooltip>
        </div>
      </template>
    </BaseTable>
  </BaseCard>

  <v-tooltip location="start">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        color="primary"
        :disabled="ability.cannot('manage', 'accounts') || activeAccounts >= userSettings.maxUsers - 1"
        size="large"
        class="veo-primary-action-fab"
        :icon="mdiPlus"
        :aria-label="t('createAccount')"
        @click="createAccountDialogVisible = true"
      />
    </template>
    <span>{{ t('createAccount') }}</span>
  </v-tooltip>

  <AccountManageDialog
    v-if="manageAccountDialogVisible"
    :model-value="manageAccountDialogVisible"
    v-bind="manageAccountProps"
    :existing-accounts="accounts"
    @update:model-value="onManageAccountDialogInput"
  />
  <!-- @vue-ignore TODO #3066 not assignable -->
  <AccountDeleteDialog
    v-if="deleteAccountDialogVisible"
    v-model="deleteAccountDialogVisible"
    v-bind="deleteAccountDialogProps"
  />
</template>

<script setup lang="ts">
import { mdiPencilOutline, mdiTrashCanOutline, mdiPlus } from '@mdi/js';
import { useQuery } from '~/composables/api/utils/query';
import accountQueryDefinition, { IVeoAccount } from '~/composables/api/queryDefinitions/accounts';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';

const { t } = useI18n();
const { profile, userSettings } = useVeoUser();
const { ability } = useVeoPermissions();

const { data: accounts, isFetching } = useQuery(accountQueryDefinition.queries.fetchAccounts);

const activeAccounts = computed(() => (accounts.value || []).filter((account) => account.enabled).length);

const onEditAccount = (data: IVeoAccount) => {
  editAccountDialogProps.value = data;
  editAccountDialogVisible.value = true;
};

const onDeleteAccount = (data: IVeoAccount) => {
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

const accountTableActions = [
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
    label: t('global.button.delete'),
    isDisabled: (item: IVeoAccount) => item.username === profile.value?.username
  }
];

const additionalTableHeaders = [
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
      item.raw.enabled ? t('global.button.yes').toString() : t('global.button.no').toString(),
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
];
</script>

<i18n src="~/locales/base/pages/administration.json"></i18n>

<style lang="scss" scoped>
.veo-primary-action-fab {
  position: fixed !important;
  bottom: 24px;
  right: 24px;
  border-radius: 50%;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
