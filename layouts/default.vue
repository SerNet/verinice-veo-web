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
      data-component-name="app-bar"
      app
      flat
    >
      <v-app-bar-nav-icon
        v-if="$vuetify.breakpoint.xs"
        @click="drawer = true"
      />
      <VeoBreadcrumbs
        :key="breadcrumbsKey"
        write-to-title
      />
      <v-spacer />
      <VeoLanguageSwitch />
      <div class="mx-3">
        <VeoTutorialButton />
      </div>
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
      data-component-name="primary-navigation"
    />
    <v-main
      style="max-height: 100vh;"
      class="overflow-hidden"
    >
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
import { createUUIDUrlParam, getFirstDomainDomaindId, separateUUIDParam } from '~/lib/utils';
import { useVeoAlerts } from '~/composables/VeoAlert';

import 'intro.js/minified/introjs.min.css';

export default defineComponent({
  setup(_props, context) {
    const { $api } = useContext();
    const route = useRoute();
    const router = useRouter();

    const { alerts, listenToRootEvents } = useVeoAlerts();
    const { t } = useI18n();
    listenToRootEvents(context.root);
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
        const unit = await $api.unit.fetch(data.resourceId);
        const { displaySuccessMessage } = useVeoAlerts();
        displaySuccessMessage(t('unit.created').toString());
        context.root.$emit(VeoEvents.UNIT_CREATED);
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
    });

    // UI related events (unit switch/creation)
    context.root.$on(VeoEvents.UNIT_CREATE, (persistent: boolean) => {
      createUnit(persistent);
    });

    // Breadcrumbs related events
    const breadcrumbsKey = ref(0);
    context.root.$on(VeoEvents.ENTITY_UPDATED, () => {
      // Update breadcrumbsKey to rerender VeoBreadcrumbs component, when entity displayName is updated
      setTimeout(() => {
        breadcrumbsKey.value += 1;
      }, 1000);
    });

    const domainId = computed((): string | undefined => {
      if (route.value.name === 'unit-domains-more') {
        return undefined;
      }
      return separateUUIDParam(route.value.params.domain).id;
    });

    const unitId = computed(() => (separateUUIDParam(route.value.params.unit).id.length > 0 ? separateUUIDParam(route.value.params.unit).id : undefined));

    return {
      domainId,
      unitId,
      drawer,
      newUnitDialog,
      breadcrumbsKey,
      alerts
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
  border-bottom: 1px solid $medium-grey;
}

::v-deep.v-main > .v-main__wrap {
  background: $background-primary;
}
</style>
