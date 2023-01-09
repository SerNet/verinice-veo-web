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
    :value="value"
    v-bind="$attrs"
    :close-disabled="isLoading"
    :headline="id ? t('updateAccount') : t('createAccount')"
    large
  >
    <template #default>
      <BaseAlert
        :value="(profile && profile.username === username) || !id"
        flat
        no-close-button
        :type="VeoAlertType.INFO"
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
          <v-form
            v-model="formIsValid"
            @submit.prevent="createOrUpdateAccount"
          >
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="formData.username"
                  :label="`${t('username')}*`"
                  :prepend-inner-icon="`mdiSvg:${mdiAccountOutline}`"
                  :disabled="!!id"
                  :rules="[requiredRule, usernameIsDuplicateRule]"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="formData.emailAddress"
                  :label="`${t('email')}*`"
                  :prepend-inner-icon="`mdiSvg:${mdiEmailOutline}`"
                  :rules="[requiredRule, mailAddressIsDuplicateRule, mailRegexRule]"
                />
              </v-col>
            </v-row>
            <v-checkbox
              v-model="formData.enabled"
              :label="t('enabled')"
            />
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="formData.firstName"
                  clearable
                  :label="`${t('firstName')}*`"
                  :rules="[requiredRule]"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="formData.lastName"
                  clearable
                  :label="`${t('lastName')}*`"
                  :rules="[requiredRule]"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <v-select
                  v-model="formData.groups"
                  clearable
                  :items="availableGroups"
                  :label="t('groups')"
                  multiple
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </BaseCard>
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
        :disabled="!formIsValid || ability.cannot('manage', 'accounts')"
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

import { IVeoAccount, useCreateAccount, useUpdateAccount } from '~/composables/api/accounts';
import { useVeoAlerts } from '~/composables/VeoAlert';

import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';
import { VeoAlertType } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    value: {
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
  emits: ['input', 'success'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { ability } = useVeoPermissions();
    const { profile } = useVeoUser();
    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

    // form stuff
    const formIsValid = ref(false);
    const formData = reactive<{ username?: string; emailAddress?: string; firstName?: string; lastName?: string; enabled?: boolean; groups?: string[]; [key: string]: any }>({});

    const usernameIsDuplicateRule = (v: any) =>
      !props.existingAccounts.find((account) => account.username === trim(v) && account.id !== props.id) || t('usernameAlreadyTaken').toString();
    const mailAddressIsDuplicateRule = (v: any) =>
      !props.existingAccounts.find((account) => account.emailAddress === trim(v) && account.id !== props.id) || t('emailAddressAlreadyTaken').toString();
    const mailRegexRule = (v: string) => (typeof v === 'string' && /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)) || t('emailAddressWrongFormat').toString();
    const requiredRule = (v: any) => (!!v && !!trim(v).length) || t('global.input.required').toString();

    const availableGroups = ref([
      {
        text: t('permissions.veo-write').toString(),
        value: 'veo-write-access'
      }
    ]);

    // Update form data from outside
    watch(
      () => props,
      (newValue) => {
        Object.assign(formData, cloneDeep(pick(newValue, 'username', 'emailAddress', 'firstName', 'lastName', 'enabled', 'groups')));
      },
      { deep: true, immediate: true }
    );

    // Reset form on close (dialog close animation is done after 250ms)
    watch(
      () => props.value,
      () => {
        if (!props.value) {
          setTimeout(() => {
            Object.assign(formData, {});
          }, 250);
        }
      }
    );

    // CRUD stuff
    const createMutationParameters = computed(() => formData);
    const { mutateAsync: create, isLoading: isLoadingCreate } = useCreateAccount();
    const updateMutationParameters = computed(() => ({ ...formData, id: props.id }));
    const { mutateAsync: update, isLoading: isLoadingUpdate } = useUpdateAccount();

    const isLoading = computed(() => isLoadingCreate.value || isLoadingUpdate.value);

    const createOrUpdateAccount = async () => {
      if (!formIsValid.value || ability.value.cannot('manage', 'accounts')) {
        return;
      }

      // Sanitize data
      Object.keys(formData).forEach((key) => {
        if (typeof formData[key] === 'string') {
          formData[key] = trim(formData[key]);
        }

        if (formData[key] === undefined || formData[key] === '') {
          delete formData[key];
        }
      });
      try {
        if (props.id) {
          await update(updateMutationParameters as any);
        } else {
          await create(createMutationParameters as any);
        }
        displaySuccessMessage(t(props.id ? 'updatingAccountSuccess' : 'creatingAccountSuccess').toString());
        emit('success');
        emit('input', false);
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
      VeoAlertType,
      mdiAccountOutline,
      mdiEmailOutline
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createAccount": "Create account",
    "creatingAccountFailed": "Couldn't create account",
    "creatingAccountSuccess": "Account was created successfully",
    "email": "Email address",
    "emailAddressAlreadyTaken": "The email address is already in use. Please choose another one.",
    "emailAddressWrongFormat": "Please enter a valid email address.",
    "enabled": "Account is enabled?",
    "firstName": "First name",
    "groups": "Assigned groups",
    "lastName": "Last name",
    "noPassword": "The password can be set by the user after verifying his email address.",
    "permissions": {
      "veo-write": "Write access"
    },
    "updateAccount": "Update account",
    "updatingAccountFailed": "Couldn't update account",
    "updatingAccountSuccess": "Account was updated successfully",
    "updatingOwnAccount": "You are updating your own account. For your own safety, editing your permissions is disabled.",
    "username": "Username",
    "usernameAlreadyTaken": "The username is already in use. Please choose another one."
  },
  "de": {
    "createAccount": "Account erstellen",
    "creatingAccountFailed": "Account konnte nicht erstellt werden",
    "creatingAccountSuccess": "Account wurde erstellt",
    "email": "E-Mail-Adresse",
    "emailAddressAlreadyTaken": "Die E-Mail Adresse wird bereits verwendet. Bitte wählen Sie eine andere.",
    "emailAddressWrongFormat": "Bitte gebe eine gültige E-Mail-Adresse ein.",
    "enabled": "Account ist aktiv?",
    "firstName": "Vorname",
    "groups": "Zugehörige Gruppen",
    "lastName": "Nachname",
    "noPassword": "Das Passwort kann vom Benutzer nach dem Verifizieren der E-Mail-Adresse gesetzt werden.",
    "permissions": {
      "veo-write": "Schreibzugriff"
    },
    "updateAccount": "Account aktualisieren",
    "updatingAccountFailed": "Account konnte nicht aktualisiert werden",
    "updatingAccountSuccess": "Account wurde aktualisiert",
    "updatingOwnAccount": "Sie bearbeiten Ihren eigenen Account. Aus Sicherheitsgründen wurde das Bearbeiten von Berechtigungen deaktiviert.",
    "username": "Benutzername",
    "usernameAlreadyTaken": "Der Benutzername wird bereits verwendet. Bitte wählen Sie einen anderen."
  }
}
</i18n>
