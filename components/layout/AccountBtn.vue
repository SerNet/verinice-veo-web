<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Davit Svandize, Jonas Heitmann
   -
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, orah,m al
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
  <v-menu
    :close-on-content-click="true"
    content-class="veo-account-menu"
    max-width="300px"
    @update:model-value="onMenuClosed"
  >
    <template #activator="{ props }">
      <v-btn
        class="mr-0"
        data-component-name="account-menu-button"
        color="primary"
        v-bind="mergeProps(props, $attrs)"
        icon
      >
        <v-avatar
          color="primary"
          size="48"
        >
          {{ initials }}
        </v-avatar>
      </v-btn>
    </template>
    <v-card flat>
      <v-list
        density="compact"
        class="pb-0"
      >
        <v-list-item lines="two">
          <template #prepend>
            <v-avatar color="primary">
              {{ initials }}
            </v-avatar>
          </template>
          <v-list-item-title>
            <span v-if="(profile && profile.firstName) || (profile && profile.lastName)">
              {{ profile.firstName }}
              {{ profile.lastName }}
            </span>
            <span
              v-else
              v-text="t('notAvailable')"
            />
          </v-list-item-title>
          <v-list-item-subtitle>{{ profile && profile.email || t('notAvailable') }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
        <v-list-item
          :href="accountLink"
          target="_blank"
        >
          <v-list-item-title class="d-flex align-center">
            {{ t('editAccount') }}
            <v-icon
              class="ml-1"
              size="x-small"
              :icon="mdiOpenInNew"
            />
          </v-list-item-title>
        </v-list-item>
        <template v-if="ability.can('manage', 'accounts')">
          <v-divider />
          <v-list-item
            color="primary"
            to="/administration"
          >
            <v-list-item-title>
              {{ $t('breadcrumbs.administration') }}
            </v-list-item-title>
          </v-list-item>
        </template>
        <v-divider />
        <v-list-item
          color="primary"
          to="/welcome"
        >
          <v-list-item-title>
            {{ t('firststeps') }}
          </v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item
          color="primary"
          to="/user-data"
        >
          <v-list-item-title>
            {{ $t('breadcrumbs.user-data') }}
          </v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item
          color="primary"
          to="/security"
        >
          <v-list-item-title>
            {{ $t('breadcrumbs.security') }}
          </v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item
          :active="displayDeploymentDetails"
          color="primary"
          @click.stop="displayDeploymentDetails = true"
        >
          <v-list-item-title>
            {{ t('about') }}
          </v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item @click="logout">
          <v-list-item-title class="font-weight-medium">
            {{ t('logout') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <DeploymentDetailsDialog v-model="displayDeploymentDetails" />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { mergeProps } from 'vue';
import { mdiOpenInNew } from '@mdi/js';

import { useVeoUser } from '~/composables/VeoUser';
import { useVeoPermissions } from '~/composables/VeoPermissions';

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
const config = useRuntimeConfig();
const { logout: _logout, profile } = useVeoUser();
const { ability } = useVeoPermissions();

const logout = () => _logout('/');

const displayDeploymentDetails = ref(false);

const firstName = computed(() => profile.value?.firstName || '');
const lastName = computed(() => profile.value?.lastName || '');
const initials = computed(() => firstName.value.substring(0, 1) + lastName.value.substring(0, 1) || '??');

const accountLink = computed(() => `${config.public.oidcUrl}/realms/${config.public.oidcRealm}/account`);

const onMenuClosed = () => {
  displayDeploymentDetails.value = false;
};
</script>

<i18n>
{
  "en": {
    "about": "About verinice.",
    "logout": "Logout",
    "editAccount": "Edit account",
    "firststeps": "First steps",
    "notAvailable": "Not available",
  },
  "de": {
    "about": "Über verinice.",
    "logout": "Abmelden",
    "editAccount": "Benutzerkonto bearbeiten",
    "firststeps": "Erste Schritte",
    "notAvailable": "Keine Angabe",
  }
}
</i18n>

<style lang="scss" scoped>
.veo-account-menu > .v-card {
  border-radius: 12px;
}
</style>
