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
  <!--<v-app>
    <v-app-bar
      class="veo-app-bar"
      data-component-name="app-bar"
      flat
    >
      <v-app-bar-nav-icon
        v-if="context.$vuetify.breakpoint.xs"
        @click="drawer = true"
      />
      <LayoutBreadcrumbs write-to-title />
      <v-spacer />
      <DownloadDocsButton v-if="$route.path.startsWith('/docs')" />
      <VeoLanguageSwitch />
      <VeoTutorialButton />
      <v-tooltip
        v-if="ability.can('view', 'documentation')"
        bottom
      >
        <template #activator="{ props }">
          <v-btn
            active-class="veo-active-list-item-no-background"
            class="mr-3"
            color="black"
            icon
            target="_blank"
            to="/docs/index"
            exact
            v-bind="props"
          >
            <v-icon :icon="`mdiSvg:${mdiHelpCircleOutline}`" />
          </v-btn>
        </template>
        <template #default>
          {{ t('openDocumentationInNewTab') }}
        </template>
      </v-tooltip>
      <VeoAppAccountBtn
        v-if="authenticated"
        @create-unit="createUnit"
      />
      <v-btn
        v-else
        color="primary"
        icon
        to="/login"
      >
        <v-icon :icon="`mdiSvg:${mdiAccountCircleOutline}`" />
      </v-btn>
    </v-app-bar>
    <LayoutPrimaryNavigation
      v-model="drawer"
      :domain-id="domainId"
      :unit-id="unitId"
      data-component-name="primary-navigation"
    />
    <v-main
      style="max-height: 100vh"
      class="overflow-hidden"
    >
      <slot />
      <LayoutCookieBanner />
    </v-main>
    <LayoutGlobalAlert
      v-if="alerts[0]"
      v-bind="alerts[0]"
    />
    <UnitsCreateDialog
      v-model="newUnitDialog.value"
      v-bind="newUnitDialog"
    />
  </v-app>-->
  <div>a123</div>
</template>

<script lang="ts" setup>
/* import { mdiAccountCircleOutline, mdiHelpCircleOutline } from '@mdi/js';

import {
  createUUIDUrlParam,
  getFirstDomainDomaindId,
  separateUUIDParam
} from '~/lib/utils';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useVeoUser } from '~/composables/VeoUser';
import 'intro.js/minified/introjs.min.css';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useCreateUnit, useFetchUnits } from '~/composables/api/units';
import { IVeoUnit } from '~/types/VeoTypes';
import { useRequest } from '~/composables/api/utils/request';

const context = useNuxtApp();
const { authenticated } = useVeoUser();
const route = useRoute();
const router = useRouter();
const { ability } = useVeoPermissions();

const { alerts, displaySuccessMessage } = useVeoAlerts();
const { request } = useRequest();
const { t } = useI18n();

useHead(() => ({
  title: 'verinice.',
  titleTemplate: '%s - verinice.veo'
}));

//
// Global navigation
//
const drawer = ref<boolean>(false);

//
// Unit creation and navigation
//
const newUnitDialog = ref({ value: false, persistent: false });

function createUnit(persistent = false) {
  newUnitDialog.value.value = true;
  newUnitDialog.value.persistent = persistent;
}

// automatically create first unit if none exists and then change to new unit
const { mutateAsync: _createUnit, data: newUnitPayload } = useCreateUnit();

const fetchUnitsDisabled = computed(() => authenticated.value);
useFetchUnits({ enabled: fetchUnitsDisabled, onSuccess: async (data: IVeoUnit[]) => {
  if(!data.length) {
    await _createUnit({
      name: t('unit.default.name'),
      description: t('unit.default.description')
    });
    displaySuccessMessage('firstUnitCreated');
    const unit = await request('/api/units/:id', { params: { id: newUnitPayload.value.resourceId } });
    const domainId = getFirstDomainDomaindId(unit);
    if (domainId) {
      router.push({
        name: 'unit-domains-domain',
        params: {
          unit: createUUIDUrlParam('unit', unit.id),
          domain: createUUIDUrlParam('domain', domainId)
        }
      });
    }
  }
} });

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
);*/
</script>

<style lang="scss" scoped>
.veo-app-bar {
  background-color: $background-accent !important;
  border-bottom: 1px solid $medium-grey;
}

:deep(.v-main) > .v-main__wrap {
  background: $background-primary;
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
