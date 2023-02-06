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
  <v-app>
    <v-app-bar
      :class="$style['app-bar']"
      flat
    >
      <div
        class="d-flex align-end ml-4"
        style="min-height: 65px;"
      >
        <nuxt-link
          to="/"
          class="text-decoration-none"
          style="width: 100%"
        >
          <LayoutAppBarLogo
            style="height: 64px"
            class="d-flex align-center"
          />
        </nuxt-link>
      </div>
      <v-spacer />
      <LayoutLanguageSwitch />
      <LayoutAccountBtn
        v-if="profile"
        :username="profile.username"
        :prename="profile.firstName"
        :lastname="profile.lastName"
        :email="profile.email"
        @logout="logout"
      />
      <v-btn
        v-else
        color="primary"
        icon
        :href="$config.accountPath"
      >
        <v-icon :icon="mdiAccountCircleOutline" />
      </v-btn>
    </v-app-bar>
    <v-main :class="$style.main">
      <slot />
      <LayoutCookieBanner />
    </v-main>
  </v-app>
</template>
  
<script lang="ts" setup>
import { mdiAccountCircleOutline } from '@mdi/js';
  
import { useVeoUser } from '~/composables/VeoUser';

const { logout: _logout, profile } = useVeoUser();
  
useHead(() => ({
  titleTemplate: '%s - verinice.veo'
}));
  
const logout = () => _logout('/');
</script>

<style lang="scss" module>
  .app-bar {
    background-color: $background-accent !important;
    border-bottom: 1px solid $medium-grey;
  
    :deep(.v-toolbar__content) {
      padding-left: 0;
    }
  }
  .main {
    background: $background-primary;
  }
  
  .main {
    display: flex;
    flex-direction: column;
  }
  </style>
