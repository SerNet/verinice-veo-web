<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Davit Svandize, Jonas Heitmann
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
  <v-menu
    v-model="menuVisible"
    :close-on-content-click="false"
    content-class="veo-account-menu"
    max-width="300px"
    offset-y
    bottom
    left
  >
    <template #activator="{ on }">
      <v-btn
        icon
        class="mr-0"
        dark
        data-component-name="account-menu-button"
        v-on="on"
      >
        <v-avatar
          size="48"
          color="secondary"
        >
          <span class="white--text text-h1">{{ initials }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-card flat>
      <v-list
        dense
        class="pb-0"
      >
        <v-list-item>
          <v-list-item-avatar color="secondary">
            <v-icon
              class="white--text text-h1"
              style="font-style: normal"
            >
              {{ initials }}
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <span v-if="prename || lastname">
              {{ prename }}
              {{ lastname }}
            </span>
            <span
              v-else
              v-text="t('notAvailable')"
            />
            <v-list-item-subtitle>{{ email || t('notAvailable') }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <template v-if="!userSettings.maxUnits || userSettings.maxUnits > 2">
          <v-divider />
          <VeoUnitSelection :units="units" />
        </template>
        <v-divider />
        <v-list-item
          :href="accountLink"
          target="_blank"
        >
          <v-list-item-title class="d-flex">
            {{ $t('myAccount') }}
            <v-icon x-small>
              {{ mdiOpenInNew }}
            </v-icon>
          </v-list-item-title>
          <VeoDeploymentDetailsDialog v-model="displayDeploymentDetails" />
        </v-list-item>
        <v-divider />
        <v-list-item @click="displayDeploymentDetails = true">
          <v-list-item-title>
            {{ $t('about') }}
          </v-list-item-title>
          <VeoDeploymentDetailsDialog v-model="displayDeploymentDetails" />
        </v-list-item>
        <v-divider />
        <v-list-item @click="$emit('logout')">
          <v-list-item-title class="font-weight-medium">
            {{ $t('logout') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch, useRoute, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiOpenInNew } from '@mdi/js';

import { IVeoUnit } from '~/types/VeoTypes';
import { useUser } from '~/composables/VeoUser';

export default defineComponent({
  props: {
    prename: { type: String, default: '' },
    lastname: { type: String, default: '' },
    username: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  setup(props) {
    const { t } = useI18n();
    const { $api, $config } = useContext();
    const { userSettings } = useUser();
    const route = useRoute();

    const displayDeploymentDetails = ref(false);
    const menuVisible = ref(false);

    const initials = computed(() => props.prename.substring(0, 1) + props.lastname.substring(0, 1) || '??');

    const unitId = computed(() => route.value.params.unit);

    watch(
      () => unitId.value,
      () => fetch()
    );

    // Unit selection stuff
    const units = ref<IVeoUnit[]>([]);

    const { fetch } = useFetch(async () => {
      units.value = await $api.unit.fetchAll();
    });

    const accountLink = computed(() => `${$config.oidcUrl}/realms/${$config.oidcRealm}/account`);

    return {
      accountLink,
      displayDeploymentDetails,
      initials,
      menuVisible,
      units,
      userSettings,

      mdiOpenInNew,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "about": "About verinice.",
    "logout": "Logout",
    "myAccount": "My account",
    "notAvailable": "Not available"
  },
  "de": {
    "about": "Über verinice.",
    "logout": "Abmelden",
    "myAccount": "Mein Account",
    "notAvailable": "Keine Angabe"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-account-menu {
  margin-top: 16px;
  contain: initial;
  overflow: visible;
}

.veo-account-menu > .v-card {
  border-radius: 12px;
}

.veo-account-menu::before {
  position: absolute;
  content: '';
  top: 0;
  right: 14px;
  transform: translateY(-100%);
  width: 10px;
  height: 13px;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 13px solid #fff;
}
</style>
