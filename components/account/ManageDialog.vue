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
                  :rules="[requiredRule, usernameIsDuplicateRule]"
                  variant="underlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.emailAddress"
                  :label="`${t('email')}*`"
                  :prepend-inner-icon="mdiEmailOutline"
                  :rules="[requiredRule, mailAddressIsDuplicateRule, mailRegexRule]"
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
                <v-select
                  v-model="formData.groups"
                  clearable
                  multiple
                  :items="availableGroups"
                  :label="t('groups')"
                  variant="underlined"
                />
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
        :disabled="formIsValid === false || ability.cannot('manage', 'accounts')"
        :loading="isLoading"
        @click="createOrUpdateAccount"
      >
        {{ id ? t('updateAccount') : t('createAccount') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { mdiAccountOutline, mdiEmailOutline } from '@mdi/js';
import { cloneDeep, pick, trim } from 'lodash';

import accountQueryDefinitions, { IVeoAccount } from '~/composables/api/queryDefinitions/accounts';
import { useVeoAlerts } from '~/composables/VeoAlert';

import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';
import { VeoAlertType } from '~/types/VeoTypes';
import { useMutation } from '~/composables/api/utils/mutation';

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
    const formIsValid = ref(true);
    const formData = ref<{
      username?: string;
      emailAddress?: string;
      firstName?: string;
      lastName?: string;
      enabled?: boolean;
      groups?: string[];
      [key: string]: any;
    }>({});

    const usernameIsDuplicateRule = (v: any) =>
      !props.existingAccounts.find((account) => account.username === trim(v) && account.id !== props.id) ||
      t('usernameAlreadyTaken').toString();
    const mailAddressIsDuplicateRule = (v: any) =>
      !props.existingAccounts.find((account) => account.emailAddress === trim(v) && account.id !== props.id) ||
      t('emailAddressAlreadyTaken').toString();
    const mailRegexRule = (v: string) =>
      (typeof v === 'string' && /^\w+([+.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)) ||
      t('emailAddressWrongFormat').toString();
    const requiredRule = (v: any) => (!!v && !!trim(v).length) || t('global.input.required').toString();

    const availableGroups = ref([
      {
        title: t('permissions.veo-write').toString(),
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
      },
      { deep: true, immediate: true }
    );

    // Reset form on close (dialog close animation is done after 250ms)
    watch(
      () => props.modelValue,
      (open) => {
        if (!open) {
          formData.value = {};
        }
      }
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

      // Sanitize data
      Object.keys(formData.value).forEach((key) => {
        if (typeof formData.value[key] === 'string') {
          formData.value[key] = trim(formData.value[key]);
        }

        if (formData.value[key] === undefined || formData.value[key] === '') {
          delete formData.value[key];
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
        displayErrorMessage(t(props.id ? 'updatingAccountFailed' : 'creatingAccountFailed').toString(), error.message);
      }
    };

    return {
      ability,
      availableGroups,
      createOrUpdateAccount,
      formData,
      formIsValid,
      isLoading,
      mailAddressIsDuplicateRule,
      mailRegexRule,
      profile,
      requiredRule,
      usernameIsDuplicateRule,

      t,
      globalT,
      VeoAlertType,
      mdiAccountOutline,
      mdiEmailOutline
    };
  }
});
</script>

<i18n src="~/locales/base/components/account-manage-dialog.json"></i18n>
