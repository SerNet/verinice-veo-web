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
    <v-app-bar :class="$style['app-bar']" flat>
      <nuxt-link to="/units" class="text-decoration-none ml-4" data-veo-test="unit-page-link">
        <LayoutAppBarLogo style="height: 60px" class="d-flex align-center" />
      </nuxt-link>

      <v-spacer />

      <LayoutThemeSwitch />

      <LayoutLanguageSwitch />

      <LayoutTutorialButton v-if="!$route.path.startsWith('/login')" />

      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            class="mr-3"
            icon
            target="_blank"
            :href="context.$config.public.documentationUrl"
            exact
            v-bind="props"
            data-component-name="docs-nav-item"
          >
            <v-icon :icon="mdiHelpCircleOutline" />
          </v-btn>
        </template>
        <template #default>
          {{ t('openDocumentationInNewTab') }}
        </template>
      </v-tooltip>

      <LayoutAccountBtn
        v-if="profile"
        class="mr-3"
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
        :href="/* @ts-ignore TODO #3066 $config does not exist*/ $config.public.accountPath"
      >
        <v-icon :icon="mdiAccountCircleOutline" />
      </v-btn>
    </v-app-bar>
    <v-main class="main bg-basepage">
      <slot />
      <LayoutCookieBanner />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { mdiAccountCircleOutline, mdiHelpCircleOutline } from '@mdi/js';
import { useVeoUser } from '~/composables/VeoUser';

const { t } = useI18n();
const { logout: _logout, profile } = useVeoUser();
const context = useNuxtApp();
//test
useHead(() => ({
  titleTemplate: '%s - verinice.veo'
}));

const logout = () => _logout('/');
</script>
<i18n src="~/locales/base/components/layout-default.json"></i18n>
<style lang="scss" module>
.app-bar {
  :deep(.v-toolbar__content) {
    padding-left: 0;
  }
}

.main {
  display: flex;
  flex-direction: column;
}
</style>
