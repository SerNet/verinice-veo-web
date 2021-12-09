<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
  <VeoDialog
    v-model="dialog"
    :headline="$t('welcome')"
    large
  >
    <template #default>
      <div
        class="mb-6 d-flex justify-center"
        style="height: 50px"
      >
        <VeoAppLogoDesktop />
      </div>
      <h2 class="mb-4">{{ t('veoClaim') }}</h2>
      <i18n
        v-if="nonDemoUnits.length"
        path="createEntitiesCTA"
        tag="p"
      >
        <nuxt-link
          v-for="(link, index) in formLinks"
          :key="index"
          :to="link.to"
          @click.native="dialog = false"
        >{{ link.name }}</nuxt-link>
      </i18n>
      <i18n
        v-if="nonDemoUnits.length"
        path="dashboardCTA"
        tag="p"
      >
        <nuxt-link
          :to="dashboardLink.to"
          @click.native="dialog = false"
        >{{ dashboardLink.name }}</nuxt-link>
      </i18n>
      <i18n
        v-if="demoUnitLink"
        path="demoUnitCTA"
        tag="p"
      >
        <nuxt-link
          :to="demoUnitLink.to"
          @click.native="dialog = false"
        >{{ demoUnitLink.name }}</nuxt-link>
      </i18n>
      <i18n
        path="lastLine"
        tag="p"
      >
        <br>
      </i18n>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="dialog = false"
      >
        {{ t('go') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { RawLocation } from 'vue-router/types/router';
import { computed, ComputedRef, defineComponent, Ref, ref, useContext, useFetch, useRoute } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import LocalStorage from '~/util/LocalStorage';
import { createUUIDUrlParam } from '~/lib/utils';
import { IVeoFormSchemaMeta, IVeoUnit } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const { t, locale } = useI18n();
    const { $api, $user } = useContext();
    const route = useRoute();

    const nonDemoUnits: Ref<IVeoUnit[]> = ref([]); // Used if the unit is not present in the url params

    useFetch(async () => {
      const forms = await $api.form.fetchAll();
      const units = await $api.unit.fetchAll();
      const domains = await $api.form.fetchAll();
      const demoUnit = units.find((unit) => unit.name === 'Demo');
      nonDemoUnits.value = units.filter((unit) => unit.name !== 'Demo');
      if (demoUnit) {
        demoUnitLink.value = {
          to: {
            name: 'unit-domains-domain',
            params: {
              unit: createUUIDUrlParam('unit', demoUnit.id),
              domain: createUUIDUrlParam('domain', domains[0].id || '')
            }
          },
          name: 'Demo-Unit'
        };
      }

      createEntityCreateLink('SCP_ResponsibleBody', forms);
      createEntityCreateLink('PER_DataProtectionOfficer', forms);
      createEntityCreateLink('PRO_DataProcessing', forms);
    });
    const dialog = computed({
      get() {
        return props.value;
      },
      set(value: boolean) {
        if (!value) {
          LocalStorage.firstStepsCompleted = true;
        }
        emit('input', false);
      }
    });

    const formLinks: Ref<{ name: string; to: RawLocation }[]> = ref([]);
    const dashboardLink: ComputedRef<{ name: string; to: RawLocation }> = computed(() => ({
      to: {
        name: 'unit-domains-domain',
        params: {
          unit: route.value.params.unit || nonDemoUnits.value.length ? createUUIDUrlParam('unit', nonDemoUnits.value[0].id) : '',
          domain: route.value.params.domain || $user.lastDomain || ''
        }
      },
      name: 'Dashboard'
    }));
    const demoUnitLink: Ref<{ name: string; to: RawLocation } | undefined> = ref(undefined);

    function createEntityCreateLink(subType: string, forms: IVeoFormSchemaMeta[]) {
      const form = forms.find((form) => form.subType === subType);
      if (form) {
        formLinks.value.push({
          name: form.name[locale.value],
          to: {
            name: 'unit-domains-domain-forms-form-create',
            params: {
              unit: route.value.params.unit || nonDemoUnits.value.length ? createUUIDUrlParam('unit', nonDemoUnits.value[0].id) : '',
              domain: route.value.params.domain || $user.lastDomain || '',
              form: createUUIDUrlParam('form', form.id as string)
            }
          }
        });
      }
    }

    return {
      dialog,
      dashboardLink,
      demoUnitLink,
      formLinks,
      nonDemoUnits,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createEntitiesCTA": "Many paths lead to the goal... record the {0}, name your {1} or create a {2}.",
    "dashboardCTA": "One step at a time... the {0} provides you with an overall view and leads you along the lifecycle of your assets directly to the next tasks or the last activities.",
    "demoUnitCTA": "You prefer to get your bearings first? Then take a look at the {0} (resets with every login).",
    "helpCTA": "Our Hints and Tutorials will show you how to use the system, and you can gain a deeper insight in the Online Documentation.",
    "lastLine": "Good luck!{0}Your verinice.TEAM",
    "go": "Lets go!",
    "veoClaim": "New for sure",
    "welcome": "Welcome to verinice.veo!"
  },
  "de": {
    "createEntitiesCTA": "Viele Wege führen zum Ziel... erfassen Sie die {0}, benennen Sie Ihre {1} oder legen Sie eine {2} an.",
    "dashboardCTA": "Ein Schritt nach dem anderen... das {0} bietet Ihnen einen Gesamtüberblick und führt Sie entlang des Lebebenszyklus Ihrer Assets direkt zu den nächsten Aufgaben oder den letzten Aktivitäten.",
    "demoUnitCTA": "Sie möchten sich lieber erst orientieren? Dann werfen Sie einen Blick auf die {0} (wird bei jedem Login zurückgesetzt).",
    "helpCTA": "Die Bedienung vermitteln Ihnen unsere Hints und Tutorials, tieferen Einblick gewinnen Sie in der Online-Dokumentation.",
    "lastLine": "Viel Erfolg wünscht!{0}Ihr verinice.TEAM",
    "go": "Los gehts!",
    "veoClaim": "Mit Sicherheit neu",
    "welcome": "Willkommen bei verinice.veo!"
  }
}
</i18n>