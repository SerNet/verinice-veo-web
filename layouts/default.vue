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
          to="/"
          class="text-decoration-none"
        >
          <VeoAppBarLogo class="ml-2" />
        </nuxt-link>
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
        class="d-flex flex-grow-1 mr-2"
        style="max-width: 120px;"
      >
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
    <VeoPrimaryNavigation v-model="drawer" />
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
import { computed, defineComponent, Ref, ref } from '@nuxtjs/composition-api';

import { ALERT_TYPE, IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents';
import { createUUIDUrlParam } from '~/lib/utils';

interface IProps {}

export default defineComponent<IProps>({
  setup(_props, context) {
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

    return { alert, drawer, lang, langs, newUnitDialog, snackbar, breadcrumbsKey };
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
