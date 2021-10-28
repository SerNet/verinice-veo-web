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
      <div class="d-flex align-center fill-height">
        <v-app-bar-nav-icon
          v-if="$vuetify.breakpoint.xs"
          @click="drawer = true"
        />
        <nuxt-link
          :to="homeLink"
          class="text-decoration-none fill-height"
        >
          <VeoAppBarLogo
            class="ml-2"
          />
        </nuxt-link>
        <div class="ml-4">
          <VeoDomainSelect v-if="$route.params.unit" />
        </div>
      </div>
      <div
        class="d-flex flex-grow-0 mr-6"
      >
        <VeoDemoUnitButton />
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
import { computed, defineComponent, Ref, ref, useContext, useRoute, useRouter } from '@nuxtjs/composition-api';

import { ALERT_TYPE, IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents';
import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';

interface IProps {}

export default defineComponent<IProps>({
  setup(_props, context) {
    const { $user, params, app } = useContext();
    const route = useRoute();
    const router = useRouter();

    //
    // Global navigation
    //
    const drawer: Ref<boolean> = ref(false);
    const lang = computed({
      get() {
        return app.i18n.locale;
      },
      set(newValue: string) {
        app.i18n.setLocale(newValue);
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
      router.push('/' + createUUIDUrlParam('unit', newUnit));
    });

    // Breadcrumbs related events
    context.root.$on(VeoEvents.ENTITY_UPDATED, () => {
      // Update breadcrumbsKey to rerender VeoBreadcrumbs component, when entity displayName is updated
      setTimeout(() => {
        breadcrumbsKey.value += 1;
      }, 1000);
    });

    // Starting with VEO-692, we don't always want to redirect to the unit selection (in fact we always want to redirect to the last used unit and possibly domain)
    const homeLink = computed(() => (params.value.domain ? `/${params.value.unit}/domains/${params.value.domain}` : `/${params.value.unit}`));

    const domain = computed((): string | undefined => separateUUIDParam(route.value.params.domain).id);

    const domainId = computed((): string | undefined => {
      if (route.value.name === 'unit-domains-more') {
        return undefined;
      }
      if (!domain.value) {
        return unitId && unitId.value === $user.lastUnit ? $user.lastDomain : undefined;
      }
      return domain.value;
    });

    const unitId = computed(() => (separateUUIDParam(route.value.params.unit).id.length > 0 ? separateUUIDParam(route.value.params.unit).id : undefined));

    return {
      domainId,
      unitId,
      alert,
      drawer,
      lang,
      langs,
      newUnitDialog,
      snackbar,
      breadcrumbsKey,
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
</style>
