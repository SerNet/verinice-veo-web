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
      <v-app-bar-nav-icon
        v-if="$vuetify.breakpoint.xs"
        @click="drawer = true"
      />
      <nuxt-link
        :to="homeLink"
        class="text-decoration-none fill-height"
      >
        <VeoAppBarLogo />
      </nuxt-link>
      <div class="ml-6 fill-height">
        <VeoDomainSelect v-if="$route.params.unit" />
      </div>
      <v-spacer />
      <VeoDemoUnitButton />
      <VeoLanguageSwitch />
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            class="veo-list-searchbar__button mx-3"
            color="black"
            icon
            role="submit"
            type="submit"
            :disabled="!hasTutorials"
            v-bind="attrs"
            @click="tutorialVisible?stopTutorial():startTutorial()"
            v-on="on"
          >
            <v-icon v-text="tutorialVisible?'mdi-information-off-outline':'mdi-information-outline'" />
          </v-btn>
        </template>
        <span v-text="t(tutorialVisible?'hideHelp':'showHelp')" />
      </v-tooltip>
      <VeoAppAccountBtn
        v-if="$user.auth.profile"
        :username="$user.auth.profile.username"
        :prename="$user.auth.profile.firstName"
        :lastname="$user.auth.profile.lastName"
        :email="$user.auth.profile.email"
        @logout="$user.auth.logout('/')"
      />
    </v-app-bar>
    <VeoPrimaryNavigation
      v-model="drawer"
      :domain-id="domainId"
      :unit-id="unitId"
    />
    <v-main
      style="max-height: 100vh;"
      class="overflow-hidden"
    >
      <VeoBreadcrumbs :key="breadcrumbsKey" />
      <nuxt />
    </v-main>
    <VeoGlobalAlert
      v-if="alerts[0]"
      v-bind="alerts[0]"
    />
    <VeoNewUnitDialog
      v-model="newUnitDialog.value"
      v-bind="newUnitDialog"
    />
  </v-app>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, useContext, useRoute, useRouter } from '@nuxtjs/composition-api';

import { useI18n } from 'nuxt-i18n-composable';
import { VeoEvents } from '~/types/VeoGlobalEvents';
import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useTutorials } from '~/composables/intro';

import 'intro.js/minified/introjs.min.css';

export default defineComponent({
  setup(_props, context) {
    const { $user, params, $api } = useContext();
    const route = useRoute();
    const router = useRouter();

    const { alerts, listenToRootEvents } = useVeoAlerts();
    const { t } = useI18n();
    listenToRootEvents(context.root);
    const { load: startTutorial, stop: stopTutorial, hasTutorials, visible: tutorialVisible } = useTutorials();
    //
    // Global navigation
    //
    const drawer: Ref<boolean> = ref(false);

    //
    // Unit creation and navigation
    //
    const newUnitDialog = ref({ value: false, persistent: false });

    const getUnits = () => {
      return $api.unit.fetchAll();
    };

    function createUnit(persistent: boolean = false) {
      newUnitDialog.value.value = true;
      newUnitDialog.value.persistent = persistent;
    }

    // automatically create first unit if none exists and then change to new unit
    onMounted(async () => {
      const units = await getUnits();
      if (units.length === 0) {
        const data = await $api.unit.create({ name: t('unit.default.name'), description: t('unit.default.description') });
        const unit = data.resourceId;
        const { displaySuccessMessage } = useVeoAlerts();
        displaySuccessMessage(t('unit.created').toString());
        context.root.$emit(VeoEvents.UNIT_CREATED);
        context.root.$emit(VeoEvents.UNIT_CHANGED, unit);
      }
    });

    // UI related events (unit switch/creation)
    context.root.$on(VeoEvents.UNIT_CREATE, (persistent: boolean) => {
      createUnit(persistent);
    });

    context.root.$on(VeoEvents.UNIT_CHANGED, (newUnit: string) => {
      router.push('/' + createUUIDUrlParam('unit', newUnit));
    });

    // Breadcrumbs related events
    const breadcrumbsKey = ref(0);
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
      drawer,
      newUnitDialog,
      breadcrumbsKey,
      homeLink,
      alerts,
      hasTutorials,
      startTutorial,
      stopTutorial,
      tutorialVisible,
      t
    };
  },
  head() {
    return {
      titleTemplate: '%s - verinice.veo'
    };
  }
});
</script>

<style lang="scss" scoped>
.veo-app-bar {
  background-color: $background-accent !important;
}

::v-deep.v-main {
  background: $background-accent;
}

::v-deep.v-main > .v-main__wrap {
  background: white;
  border-left: 1px solid $medium-grey;
  border-top: 1px solid $medium-grey;
  border-top-left-radius: 16px;
  display: flex;
  flex-direction: column;
}

@media screen and (max-width: 600px) {
  ::v-deep.v-main > .v-main__wrap {
    border-top-left-radius: 0;
  }
}
</style>

<i18n>
{
  "de": {
    "showHelp": "Kontext-Hilfe anzeigen",
    "hideHelp": "Kontext-Hilfe ausblenden"
  },
  "en": {
    "showHelp": "Show contextual help",
    "hideHelp": "Hide contextual help"
  }
}
</i18n>
