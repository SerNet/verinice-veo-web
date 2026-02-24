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
    :model-value="modelValue"
    v-bind="$attrs"
    :close-disabled="isLoading"
    :title="id ? t('updateAccount') : t('createAccount')"
    large
    fixed-footer
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <BaseAlert
        :title="t('password')"
        :model-value="(profile && profile.username === username) || !id"
        flat
        no-close-button
        :type="VeoAlertType.INFO"
        class="mb-2"
      >
        <span v-if="id">
          {{ t('updatingOwnAccount') }}
        </span>
        <span v-else>
          {{ t('noPassword') }}
        </span>
      </BaseAlert>
      <BaseCard>
        <v-card-text>
          <v-form v-model="formIsValid" @submit.prevent="createOrUpdateAccount">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.username"
                  :label="`${t('username')}*`"
                  :prepend-inner-icon="mdiAccountOutline"
                  :disabled="!!id"
                  :rules="[requiredRule, usernameIsDuplicateRule, usernameTooShort]"
                  variant="underlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.emailAddress"
                  :label="`${t('email')}*`"
                  :prepend-inner-icon="mdiEmailOutline"
                  :rules="[requiredRule, mailAddressIsDuplicateRule, mailValidator]"
                  variant="underlined"
                />
              </v-col>
            </v-row>
            <v-checkbox v-model="formData.enabled" :label="t('enabled')" />
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.firstName"
                  clearable
                  :label="`${t('firstName')}*`"
                  :rules="[requiredRule]"
                  variant="underlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.lastName"
                  clearable
                  :label="`${t('lastName')}*`"
                  :rules="[requiredRule]"
                  variant="underlined"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-tooltip location="top" width="300">
                  <template #activator="{ props: tooltipProps }">
                    <v-select
                      v-model="formData.groups"
                      clearable
                      multiple
                      v-bind="tooltipProps"
                      :items="availableRoles"
                      :label="t('roles')"
                      variant="underlined"
                    />
                  </template>
                  <span>{{ t('tooltips.roles') }}</span>
                </v-tooltip>
              </v-col>

              <v-col v-if="showAccessGroupsFeature" cols="12" md="6">
                <v-tooltip location="top" width="300">
                  <template #activator="{ props: tooltipProps }">
                    <v-select
                      v-model="formData.accessGroups"
                      multiple
                      chips
                      closable-chips
                      v-bind="tooltipProps"
                      :items="accessGroups"
                      item-title="name"
                      item-value="id"
                      :label="t('accessGroups')"
                      variant="underlined"
                    >
                      <template #selection="{ item, index }">
                        <v-chip v-if="index === 0">
                          <span>{{ item.raw.name }}</span>
                        </v-chip>
                        <span v-if="index === 1" class="text-grey text-caption align-self-center ml-2">
                          (+{{ formData.accessGroups.length - 1 }} others)
                        </span>
                      </template>
                    </v-select>
                  </template>
                  <span>{{ t('tooltips.accessGroups') }}</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </BaseCard>
    </template>
    <template #dialog-options>
      <v-btn :disabled="isLoading" @click="$emit('update:model-value', false)">
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        color="primary"
        :disabled="!formIsValid || !isDirty || ability.cannot('manage', 'accounts')"
        :loading="isLoading"
        @click="createOrUpdateAccount"
      >
        {{ id ? t('updateAccount') : t('createAccount') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { mdiAccountOutline, mdiEmailOutline } from '@mdi/js';
import { cloneDeep, isEqual, pick, trim } from 'lodash';

import type { IVeoAccount } from '~/composables/api/queryDefinitions/accounts';
import accountQueryDefinitions from '~/composables/api/queryDefinitions/accounts';
import { useVeoAlerts } from '~/composables/VeoAlert';

import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';
import { VeoAlertType } from '~/types/VeoTypes';
import { useMutation } from '~/composables/api/utils/mutation';
import type { IVeoAccessGroup } from '~/composables/api/queryDefinitions/accessGroups';
import { hasFeature } from '~/utils/featureFlags';
import { useRules } from '~/composables/utils';

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    },
    username: {
      type: String,
      default: ''
    },
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    emailAddress: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: true
    },
    groups: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    accessGroups: {
      type: Array as PropType<IVeoAccessGroup[]>,
      default: () => []
    },
    existingAccounts: {
      type: Array as PropType<IVeoAccount[]>,
      default: () => []
    }
  },
  emits: ['update:model-value', 'success'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });
    const { ability } = useVeoPermissions();
    const { profile } = useVeoUser();
    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
    // form stuff
    const originalData = computed(() => {
      const data = pick(props, ['username', 'emailAddress', 'firstName', 'lastName', 'enabled', 'groups']);
      const accessGroups = props.existingAccounts.find((acc) => acc.id === props.id)?.accessGroups ?? [];
      return { ...data, accessGroups };
    });
    const formIsValid = ref<boolean | null>(null);
    const formData = ref<{
      username?: string;
      emailAddress?: string;
      firstName?: string;
      lastName?: string;
      enabled?: boolean;
      roles?: string[];
      groups?: string[];
      accessGroups?: IVeoAccessGroup[];
      [key: string]: any;
    }>({});
    const isDirty = computed(() => !isEqual(formData.value, originalData.value));

    const usernameIsDuplicateRule = (v: any) => {
      const trimmedValue = trim(v);
      const isDuplicate = props.existingAccounts.find(
        (account) => account.username === trimmedValue && account.id !== props.id
      );
      const isLoggedInUser = profile.value?.username === trimmedValue && props.id !== profile.value?.id;
      if (isDuplicate || isLoggedInUser) {
        return t('usernameAlreadyTaken').toString();
      }
      return true;
    };

    const mailAddressIsDuplicateRule = (v: any) => {
      const trimmedValue = trim(v);
      if (!trimmedValue) return true;
      const isDuplicateInList = props.existingAccounts.find(
        (account) => account.emailAddress === trimmedValue && account.id !== props.id
      );
      const isLoggedInUserEmail = profile.value?.email === trimmedValue && props.id !== profile.value?.id;
      if (isDuplicateInList || isLoggedInUserEmail) {
        return t('emailAddressAlreadyTaken').toString();
      }
      return true;
    };
    const requiredRule = (v: any) => (!!v && !!trim(v).length) || t('global.input.required').toString();

    const { mailValidator, usernameTooShort } = useRules();

    const availableRoles = ref([
      {
        title: t('permissions.editors').toString(),
        value: 'veo-write-access'
      }
    ]);

    // Update form data from outside
    watch(
      () => props,
      (newValue) => {
        formData.value = cloneDeep(
          pick(newValue, 'username', 'emailAddress', 'firstName', 'lastName', 'enabled', 'groups')
        );
        formData.value.accessGroups = props.existingAccounts.find((acc) => acc.id === props.id)?.accessGroups ?? [];
      },
      { deep: true, immediate: true }
    );

    // Reset form on close (dialog close animation is done after 250ms)
    watch(
      () => props.modelValue,
      (isOpen) => {
        if (isOpen) {
          formData.value = cloneDeep(originalData.value);
          formIsValid.value = null;
        } else {
          formData.value = {};
        }
      },
      { immediate: true }
    );

    // CRUD stuff
    const createMutationParameters = computed(() => formData.value);
    const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
      accountQueryDefinitions.mutations.createAccount
    );
    const updateMutationParameters = computed(() => ({
      ...formData.value,
      id: props.id
    }));
    const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
      accountQueryDefinitions.mutations.updateAccount
    );
    const isLoading = computed(() => isLoadingCreate.value || isLoadingUpdate.value);
    const createOrUpdateAccount = async () => {
      if (formIsValid.value === false || ability.value.cannot('manage', 'accounts')) {
        return;
      }
      const errorMessage = t(props.id ? 'updatingAccountFailed' : 'creatingAccountFailed').toString();

      // Sanitize data
      Object.keys(formData.value).forEach((key) => {
        if (typeof formData.value[key] === 'string') {
          formData.value[key] = trim(formData.value[key]);
        }

        if (formData.value[key] === undefined || formData.value[key] === '') {
          // In Vue 3 the recommended pattern is to rebuild the object without that key, instead of deleting it to keep reactivity ...
          const { [key]: _, ...values } = formData.value;
          // ... and reassign the filtered(!) object
          formData.value = values;
        }
      });
      try {
        if (props.id) {
          await update(updateMutationParameters);
        } else {
          await create(createMutationParameters);
        }
        displaySuccessMessage(t(props.id ? 'updatingAccountSuccess' : 'creatingAccountSuccess').toString());
        emit('success');
        emit('update:model-value', false);
      } catch (error: any) {
        if (error?.code === 409) {
          displayErrorMessage(errorMessage, t('emailAddressOrUsernameAlreadyTaken').toString());
        } else displayErrorMessage(errorMessage, error.message);
      }
    };

    //featureFlag
    const showAccessGroupsFeature = hasFeature('accessGroups');

    return {
      ability,
      availableRoles,
      createOrUpdateAccount,
      formData,
      formIsValid,
      isLoading,
      mailAddressIsDuplicateRule,
      profile,
      requiredRule,
      usernameIsDuplicateRule,
      mailValidator,
      usernameTooShort,
      isDirty,

      t,
      globalT,
      VeoAlertType,
      mdiAccountOutline,
      mdiEmailOutline,

      showAccessGroupsFeature
    };
  }
});
</script>

<i18n src="~/locales/base/components/account-manage-dialog.json"></i18n>
