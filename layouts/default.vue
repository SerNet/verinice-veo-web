<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Philipp Ballhausen, Davit Svandize, Jonas Heitmann, Annemarie Bufe
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
      data-component-name="app-bar"
      flat
    >
      <v-app-bar-nav-icon
        v-if="xs"
        @click="drawer = !drawer"
      />
      <nuxt-link
        to="/"
        :target="route.path.startsWith('/docs') ? '_blank' : undefined"
        class="text-decoration-none ml-4"
        data-component-name="logo"
      >
        <LayoutAppBarLogo
          style="height: 60px"
          class="d-flex align-center"
        />
      </nuxt-link>
      <LayoutBreadcrumbs write-to-title />
      <v-spacer />
      <DocsDownloadButton v-if="$route.path.startsWith('/docs')" />
      <LayoutLanguageSwitch />
      <LayoutTutorialButton v-if="!$route.path.startsWith('/docs')" />
      <v-tooltip
        v-if="ability.can('view', 'documentation')"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn
            v-if="!$route.path.startsWith('/docs')"
            active-class="veo-active-list-item-no-background"
            class="mr-3"
            color="black"
            icon
            target="_blank"
            to="/docs/index"
            exact
            v-bind="props"
          >
            <v-icon :icon="mdiHelpCircleOutline" />
          </v-btn>
        </template>
        <template #default>
          {{ t('openDocumentationInNewTab') }}
        </template>
      </v-tooltip>
      <LayoutAccountBtn
        v-if="authenticated"
        class="mr-3"
      />
      <v-btn
        v-else
        color="primary"
        icon
        to="/login"
      >
        <v-icon :icon="mdiAccountCircleOutline" />
      </v-btn>
    </v-app-bar>
    <LayoutPrimaryNavigation
      v-model="drawer"
      :domain-id="domainId"
      :unit-id="unitId"
      data-component-name="primary-navigation"
    />
    <v-main :class="$style.main">
      <slot />
      <LayoutCookieBanner />
    </v-main>
    <LayoutGlobalAlert
      v-if="alerts[0]"
      v-bind="alerts[0]"
    />
  </v-app>
</template>

<script lang="ts" setup>
import { useDisplay } from 'vuetify';
import { mdiAccountCircleOutline, mdiHelpCircleOutline } from '@mdi/js';
import 'intro.js/minified/introjs.min.css';

import { separateUUIDParam } from '~/lib/utils';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useVeoUser } from '~/composables/VeoUser';
import { useVeoPermissions } from '~/composables/VeoPermissions';

const { xs } = useDisplay();
const { authenticated } = useVeoUser();
const route = useRoute();
const { ability } = useVeoPermissions();

const { alerts } = useVeoAlerts();
const { t } = useI18n();

useHead(() => ({
  titleTemplate: '%s - verinice.veo'
}));

//
// Global navigation
//
const drawer = ref<boolean>(true);

const domainId = computed((): string | undefined => {
  if (route.name === 'unit-domains-more') {
    return undefined;
  }
  return separateUUIDParam(route.params.domain as string).id;
});

const unitId = computed(() =>
  separateUUIDParam(route.params.unit as string).id.length > 0
    ? separateUUIDParam(route.params.unit as string).id
    : undefined
);
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

<i18n>
{
  "en": {
    "firstUnitCreated": "First unit was created successfully",
    "openDocumentationInNewTab": "Open online documentation in new tab"
  },
  "de": {
    "firstUnitCreated": "Die erste Unit wurde erfolgreich erstellt",
    "openDocumentationInNewTab": "Online-Dokumentaion in neuem Tab öffnen"
  }
}
</i18n>
