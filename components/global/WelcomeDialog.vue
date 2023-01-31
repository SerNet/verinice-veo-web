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
  <BaseDialog
    v-bind="$attrs"
    :headline="t('welcome')"
    large
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <div
        class="mb-6 d-flex justify-center"
        style="height: 50px"
      >
        <LayoutAppLogoDesktop />
      </div>
      <h2 class="text-h2 mb-4">
        {{ t('veoClaim') }}
      </h2>
      <i18n-t
        v-if="formLinks.length"
        keypath="createEntitiesCTA"
        tag="p"
        scope="global"
      >
        <template v-if="firstUnitId">
          <nuxt-link
            v-for="(link, index) in formLinks"
            :key="index"
            :to="link.to"
            @click="$emit('update:model-value', false)"
          >
            {{ link.name }}
          </nuxt-link>
        </template>
        <template v-else>
          <span
            v-for="(link, index) in formLinks"
            :key="index"
          >
            {{ link.name }}
          </span>
        </template>
      </i18n-t>
      <i18n-t
        keypath="dashboardCTA"
        tag="p"
        scope="global"
      >
        <nuxt-link
          v-if="firstUnitId"
          :to="dashboardLink.to"
          @click="$emit('update:model-value', false)"
        >
          {{ dashboardLink.name }}
        </nuxt-link>
        <span v-else>{{ dashboardLink.name }}</span>
      </i18n-t>
      <i18n-t
        v-if="demoUnitLink"
        keypath="demoUnitCTA"
        tag="p"
        scope="global"
      >
        <nuxt-link
          :to="demoUnitLink.to"
          @click="$emit('update:model-value', false)"
        >
          {{ demoUnitLink.name }}
        </nuxt-link>
      </i18n-t>
      <i18n-t
        keypath="lastLine"
        tag="p"
        scope="global"
      >
        <br>
      </i18n-t>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="$emit('update:model-value', false)"
      >
        {{ t('go') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { ComputedRef } from 'vue';

import { createUUIDUrlParam, getFirstDomainDomaindId, separateUUIDParam } from '~/lib/utils';
import { useFetchForms } from '~/composables/api/forms';
import { RouteLocationRaw } from 'vue-router';
import { useFetchUnits } from '~/composables/api/units';
import { useFetchUnitDomains } from '~/composables/api/domains';

export default defineComponent({
  emits: ['update:model-value'],
  setup() {
    const { t, locale } = useI18n();
    const route = useRoute();

    const firstUnitId: ComputedRef<string | undefined> = computed(() => nonDemoUnits.value[0]?.id);

    const domainId = computed(() => separateUUIDParam(route.params.domain as string).id);
    const unitId = computed(() => separateUUIDParam(route.params.unit as string).id);

    const queryParameters = computed(() => ({
      domainId: domainId.value
    }));
    const queryEnabled = computed(() => !!domainId.value);
    const { data: formSchemas } = useFetchForms(queryParameters, { enabled: queryEnabled });

    const { data: units } = useFetchUnits({ placeholderData: [] });
    const demoUnit = computed(() => units.value.find((unit) => unit.name === 'Demo'));
    const nonDemoUnits = computed(() => units.value.filter((unit) => unit.name !== 'Demo' && getFirstDomainDomaindId(unit)));

    const fetchUnitDomainsQueryParameters = computed(() => ({ unitId: demoUnit.value?.id }));
    const fetchUnitDomainsQueryEnabled = computed(() => !!demoUnit.value);
    const { data: demoUnitDomains } = useFetchUnitDomains(fetchUnitDomainsQueryParameters, { enabled: fetchUnitDomainsQueryEnabled });

    const dsgvoDomain = computed(() => demoUnitDomains.value.find((domain) => domain.name === 'DS-GVO'));

    const demoUnitLink = computed<{ name: string; to: RouteLocationRaw } | undefined>(() => dsgvoDomain.value ? {
      to: {
        name: 'unit-domains-domain',
        params: {
          unit: createUUIDUrlParam('unit', demoUnit.value.id),
          domain: createUUIDUrlParam('domain', dsgvoDomain.value.id || '')
        }
      },
      name: 'Demo-Unit'
    } : undefined);

    const formLinksToCreate = [
      ['scope', 'SCP_ResponsibleBody'],
      ['person', 'PER_DataProtectionOfficer'],
      ['process', 'PRO_DataProcessing']
    ];
    const formLinks = computed<any[]>(() => formLinksToCreate.map((details) => createEntityCreateLink(details[0], details[1])).filter((link) => link));
    const dashboardLink: ComputedRef<{ name: string; to: RouteLocationRaw }> = computed(() => ({
      to: {
        name: 'unit-domains-domain',
        params: {
          unit: unitId.value || (firstUnitId.value ? createUUIDUrlParam('unit', firstUnitId.value) : ''),
          domain: domainId.value
        }
      },
      name: 'Dashboard'
    }));

    function createEntityCreateLink(objectType: string, subType: string) {
      const form = (formSchemas.value || []).find((form) => form.subType === subType);
      if (form) {
        return {
          name: form.name[locale.value],
          to: {
            name: 'unit-domains-domain-objects',
            params: {
              unit: unitId.value || (firstUnitId.value ? createUUIDUrlParam('unit', firstUnitId.value) : ''),
              domain: domainId.value
            },
            query: {
              objectType,
              subType
            }
          }
        };
      } else {
        return undefined;
      }
    }

    return {
      dashboardLink,
      demoUnitLink,
      formLinks,
      firstUnitId,

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
    "demoUnitCTA": "You prefer to get your bearings first? Then take a look at the {0}.",
    "helpCTA": "Our Hints and Tutorials will show you how to use the system, and you can gain a deeper insight in the Online Documentation.",
    "lastLine": "Good luck!{0}Your verinice.TEAM",
    "go": "Lets go!",
    "veoClaim": "New for sure",
    "welcome": "Welcome to verinice.veo!"
  },
  "de": {
    "createEntitiesCTA": "Viele Wege führen zum Ziel... erfassen Sie die {0}, benennen Sie Ihre {1} oder legen Sie eine {2} an.",
    "dashboardCTA": "Ein Schritt nach dem anderen... das {0} bietet Ihnen einen Gesamtüberblick und führt Sie entlang des Lebebenszyklus Ihrer Assets direkt zu den nächsten Aufgaben oder den letzten Aktivitäten.",
    "demoUnitCTA": "Sie möchten sich lieber erst orientieren? Dann werfen Sie einen Blick auf die {0}.",
    "helpCTA": "Die Bedienung vermitteln Ihnen unsere Hints und Tutorials, tieferen Einblick gewinnen Sie in der Online-Dokumentation.",
    "lastLine": "Viel Erfolg wünscht!{0}Ihr verinice.TEAM",
    "go": "Los gehts!",
    "veoClaim": "Mit Sicherheit neu",
    "welcome": "Willkommen bei verinice.veo!"
  }
}
</i18n>
