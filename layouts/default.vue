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
      class="veo-app-bar"
      app
      clipped-left
      flat
    >
      <div class="d-flex">
        <v-app-bar-nav-icon
          v-if="$vuetify.breakpoint.xs"
          @click="drawer = true"
        />
        <nuxt-link
          :to="homeLink"
          class="text-decoration-none"
        >
          <VeoAppBarLogo
            class="ml-2"
          />
        </nuxt-link>

        <!-- Current domain -->
        <div v-if="$route.params.unit">
          <v-select
            :value="domainId"
            :items="domains"
            item-text="name"
            item-value="id"
            hide-details
            outlined
            filled
            primary
            class="ma-3"
            style="font-size: 1.2rem; max-width: 200px"
            :placeholder="$route.name !== 'unit-domains-more' ? $t('noDomainSelected') : $t('breadcrumbs.more_modules')"
            :menu-props="{ closeOnContentClick: true, 'max-width': '256px', bottom:true, offsetY:true }"
            @change="onDomainChange"
          >
            <template #append-item>
              <v-divider class="mt-6" />
              <v-list-item
                :to="`/${$route.params.unit}/domains/more`"
                exact-active-class="veo-active-link-item"
              >
                {{ $t('breadcrumbs.more_modules') }}
              </v-list-item>
            </template>
          </v-select>
        </div>
      </div>
      <div
        class="d-flex align-center"
        style="width: 60%; max-width: 500px; cursor: no-drop"
      >
        <v-text-field
          :label="$t('search.label')"
          hide-details
          background-color="grey"
          height="40"
          disabled
          class="veo-app-bar-search"
          style="visibility: hidden"
        />
      </div>
      <div
        class="d-flex flex-grow-0 mr-6"
      >
        <v-tooltip
          v-if="!userIsInDemoUnit"
          top
          :disabled="!!demoUnit"
        >
          <template #activator="{ on }">
            <div
              class="d-inline-block"
              v-on="on"
              @click.prevent
            >
              <v-btn
          
                color="primary"
                :disabled="!demoUnit"
                class="mx-4"
                depressed
                @click="goToUnit(demoUnit.id)"
              >
                <v-icon class="mr-2">
                  mdi-login-variant
                </v-icon>
                {{ $t('goToDemoUnit') }}
              </v-btn>
            </div>
          </template>
          <template #default>
            {{ $t('noDemoUnit') }}
          </template>
        </v-tooltip>
        
        <v-btn
          v-else
          color="primary"
          class="mx-4"
          depressed
          :disabled="units.length === 0"
          @click="goToUnit(units[0].id)"
        >
          <v-icon class="mr-2">
            mdi-logout-variant
          </v-icon>
          {{ $t('leaveDemoUnit') }}
        </v-btn>
        <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              outlined
              color="primary"
              v-on="on"
            >
              <v-icon
                left
                dark
              >
                mdi-earth
              </v-icon>
              {{ $i18n.locale.toUpperCase() }}
              <v-icon
                right
                dark
              >
                mdi-chevron-down
              </v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item-group
              v-model="lang"
              color="primary"
            >
              <v-list-item
                v-for="(item) in langs"
                :key="item.text"
                :value="item.value"
              >
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
      </div>
      <VeoAppAccountBtn
        v-if="$user.auth.profile"
        :username="$user.auth.profile.username"
        :prename="$user.auth.profile.firstName"
        :lastname="$user.auth.profile.lastName"
        :email="$user.auth.profile.email"
        @logout="$user.auth.logout('/')"
      />
      <span v-else />
    </v-app-bar>
    <VeoPrimaryNavigation
      v-model="drawer"
      :domain-id="domainId"
    />
    <v-main
      style="max-height: 100vh;"
      class="overflow-hidden"
    >
      <VeoBreadcrumbs :key="breadcrumbsKey" />
      <VeoPageWrapper>
        <nuxt />
      </VeoPageWrapper>
    </v-main>
    <VeoSnackbar
      v-model="snackbar.value"
      v-bind="snackbar"
    />
    <VeoAlert
      v-model="alert.value"
      v-bind="alert"
      style="position: fixed; width: 60%; bottom: 0; left: 20%; z-index: 1"
    />
    <VeoNewUnitDialog
      v-model="newUnitDialog.value"
      v-bind="newUnitDialog"
    />
  </v-app>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, Ref, ref, useContext } from '@nuxtjs/composition-api';

import { ALERT_TYPE, IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents';
import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { IVeoUnit, IVeoDomain } from '~/types/VeoTypes';

interface IProps {}

export default defineComponent<IProps>({
  setup(_props, context) {
    const { $api, params, app } = useContext();

    //
    // Global navigation
    //
    const drawer: Ref<boolean> = ref(false);
    const lang = computed({
      get() {
        return context.root.$i18n.locale;
      },
      set(newValue: string) {
        context.root.$i18n.setLocale(newValue);
        // After the language change, reload the page to avoid synchronisation problems
        // Reload here should not be a big problem, because a user will not often change the language
        window.location.reload();
      }
    });
    const langs = ref([
      { value: 'en', text: 'EN' },
      { value: 'de', text: 'DE' }
    ]);

    //
    // Unit creation and navigation
    //
    const newUnitDialog = ref({ value: false, persistent: false });

    function createUnit(persistent: boolean = false) {
      newUnitDialog.value.value = true;
      newUnitDialog.value.persistent = persistent;
    }

    //
    // Handling of global events
    //
    const alert = ref({ value: false, text: '', title: '', type: ALERT_TYPE.INFO });
    const snackbar = ref({ value: false, text: '' });
    const breadcrumbsKey = ref(0);

    // Alert and snackbar events
    context.root.$on(VeoEvents.ALERT_ERROR, (payload: IVeoEventPayload) => {
      alert.value.text = payload.text;
      alert.value.title = payload.title || '';
      alert.value.type = ALERT_TYPE.ERROR;
      alert.value.value = true;
    });
    context.root.$on(VeoEvents.ALERT_INFO, (payload: IVeoEventPayload) => {
      alert.value.text = payload.text;
      alert.value.title = payload.title || '';
      alert.value.type = ALERT_TYPE.INFO;
      alert.value.value = true;
    });
    context.root.$on(VeoEvents.ALERT_SUCCESS, (payload: IVeoEventPayload) => {
      alert.value.text = payload.text;
      alert.value.title = payload.title || '';
      alert.value.type = ALERT_TYPE.SUCCESS;
      alert.value.value = true;
    });
    context.root.$on(VeoEvents.ALERT_WARNING, (payload: IVeoEventPayload) => {
      alert.value.text = payload.text;
      alert.value.title = payload.title || '';
      alert.value.type = ALERT_TYPE.WARNING;
      alert.value.value = true;
    });
    context.root.$on(VeoEvents.ALERT_CLOSE, () => {
      alert.value.value = false;
    });

    context.root.$on(VeoEvents.SNACKBAR_SUCCESS, (payload: IVeoEventPayload) => {
      snackbar.value.text = payload.text;
      snackbar.value.value = true;
    });
    context.root.$on(VeoEvents.SNACKBAR_CLOSE, () => {
      snackbar.value.value = false;
    });

    // UI related events (unit switch/creation)
    context.root.$on(VeoEvents.UNIT_CREATE, (persistent: boolean) => {
      createUnit(persistent);
    });

    context.root.$on(VeoEvents.UNIT_CHANGED, (newUnit: string) => {
      context.root.$router.push('/' + createUUIDUrlParam('unit', newUnit));
    });

    // Breadcrumbs related events
    context.root.$on(VeoEvents.ENTITY_UPDATED, () => {
      // Update breadcrumbsKey to rerender VeoBreadcrumbs component, when entity displayName is updated
      setTimeout(() => {
        breadcrumbsKey.value += 1;
      }, 1000);
    });

    // Starting with VEO-692, we don't always want to redirect to the unit selection (in fact we always want to redirect to the last used unit and possibly domain)
    const homeLink = computed(() => `/${params.value.unit}/domains/${params.value.domain}`);

    // Demo unit/unit selection
    const units: Ref<IVeoUnit[]> = ref([]);

    async function loadUnits() {
      units.value = await $api.unit.fetchAll();
    }

    // Load all domains
    const domains: Ref<IVeoDomain[]> = ref([]);

    async function loadDomains() {
      domains.value = await $api.domain.fetchAll();
    }

    const domain = computed((): string | undefined => separateUUIDParam(context.root.$route.params.domain).id);

    const domainId = computed((): string | undefined => {
      if (context.root.$route.name === 'unit-domains-more') {
        return undefined;
      }
      if (!domain) {
        return unitId && unitId.value === context.root.$user.lastUnit ? context.root.$user.lastDomain : undefined;
      }
      return domain.value;
    });

    function onDomainChange(domainId: string) {
      context.root.$router.push(`/${context.root.$route.params.unit}/domains/${createUUIDUrlParam('domain', domainId)}`);
    }

    const unitId = computed(() => (separateUUIDParam(context.root.$route.params.unit).id.length > 0 ? separateUUIDParam(context.root.$route.params.unit).id : undefined));

    // While loading the unit id passed to the createUUIDUrlParam function would be undefined in the template, creating an error. Thus we have to navigate using this function.
    function goToUnit(unitId: string) {
      if (unitId) {
        app.router?.push(`/${createUUIDUrlParam('unit', unitId)}`);
      }
    }

    const userIsInDemoUnit = computed(() => params.value.unit && separateUUIDParam(params.value.unit).id === units.value.find((unit) => unit.name === 'Demo')?.id);
    const demoUnit: ComputedRef<IVeoUnit | undefined> = computed(() => units.value.find((unit) => unit.name === 'Demo'));

    loadUnits();
    loadDomains();

    return {
      domainId,
      unitId,
      alert,
      domains,
      drawer,
      lang,
      langs,
      newUnitDialog,
      snackbar,
      breadcrumbsKey,
      userIsInDemoUnit,
      demoUnit,
      units,
      goToUnit,
      onDomainChange,
      homeLink
    };
  },
  head() {
    return {
      titleTemplate: '%s - verinice.'
    };
  }
});
</script>

<i18n>
{
  "en": {
    "goToDemoUnit": "go to demo-unit",
    "leaveDemoUnit": "leave demo-unit",
    "noDemoUnit": "No demo unit exists for this account",
    "noDomainSelected": "No module selected"
  },
  "de": {
    "goToDemoUnit": "Zur Demo-Unit",
    "leaveDemoUnit": "Demo-Unit verlassen",
    "noDemoUnit": "Für diesen Account existiert keine Demo Unit",
    "noDomainSelected": "Kein Modul ausgewählt"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-app-bar {
  background-color: white !important;
  box-shadow: inset 0 -1px 0 $grey !important;

  .v-toolbar__content {
    > * {
      flex-grow: 1;
      flex-basis: 0;
    }
  }
}

.veo-app-bar-search {
  border-radius: 4px;

  ::v-deep .v-input__slot {
    padding: 0 16px;
  }

  ::v-deep .v-input__slot:before {
    border-top: 0 !important;
  }
}
</style>
