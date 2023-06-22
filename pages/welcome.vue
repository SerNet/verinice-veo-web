<!--
   - verinice.veo web
   - Copyright (C) 2023 Frank Schneider
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
  <BasePage>
    <div class="d-flex justify-center">      
      <BaseCard
        class="my-12"
        style="width: 33%; max-width: 640px; min-width: 400px;"
      >
        <v-card-title>
          {{ t('greeting') }}
          <div
            class="mx-4 d-flex"
            style="height: 60px; width: 240px;"
          >
            <LayoutAppLogoDesktop />
          </div>        
        </v-card-title>

        <br><br>
        
        <v-card-subtitle>{{ t('headline') }}</v-card-subtitle>

        <v-card-text>
          {{ t('intro') }}
        </v-card-text>

        <v-divider />

        <v-card-text>
          <v-icon
            :icon="mdiInformationOutline"
            size="x-large"
            start
          />
          <i18n-t
            keypath="firstSteps.tutorial"
            tag="span"
            scope="global"
          >
            <strong>{{ t('tutorial') }}</strong>
          </i18n-t>
        </v-card-text>

        <v-card-text>
          <v-icon
            :icon="mdiHelpCircleOutline"
            size="x-large"
            start
          />
          <i18n-t
            keypath="firstSteps.documentation"
            tag="span"
            scope="global"
          >
            <template #link>
              <nuxt-link
                to="/docs"
                target="_blank"
              >
                <strong>{{ t('documentation') }}</strong>
              </nuxt-link>
            </template>
          </i18n-t>
        </v-card-text>

        <v-card-text>
          <v-icon
            :icon="mdiCableData"
            size="x-large"
            start
          />
          <i18n-t
            keypath="firstSteps.sampledata"
            tag="span"
            scope="global"
          >
            <strong>{{ t('sampledata') }}</strong>
          </i18n-t>
        </v-card-text>

        <v-layout
          class="mb-4 justify-center"
        >
          <v-btn
            color="primary"
            :disabled="maxUnitsExceeded"
            elevation="2"
            :prepend-icon="mdiCableData"
            size="large"
            variant="flat"
            @click="createUnit"
          >
            {{ t('sampleDataButtonLabel') }}
          </v-btn>
        </v-layout>
        <v-progress-linear
          v-if="isLoading"
          class="my-4"
          color="primary"
          height="32"
          indeterminate
          striped
        >
          <span style="color: white;">{{ t('applyProfile').toUpperCase() }}</span>
        </v-progress-linear>

        <BaseAlert
          v-if="maxUnitsExceeded && !isLoading"
          :model-value="true"
          :type="VeoAlertType.INFO"
          :buttons="[{text: t('goto'), onClick: () => navigateTo('/')}]"
          class="ma-4"
          flat
          no-close-button
        >
          {{ t('requestForDeletion') }}
        </BaseAlert>

        <v-divider />

        <v-card-text>
          <v-icon
            :icon="mdiYoutubeTv"
            size="x-large"
            start
          />
          <i18n-t
            keypath="firstSteps.channel"
            tag="span"
            scope="global"
          >
            <a
              :href="links.youtube"
              target="_blank"
            >
              <strong>{{ t('channel') }}</strong>
            </a>
          </i18n-t>
        </v-card-text>

        <v-card-text>
          <v-icon
            :icon="mdiSchoolOutline"
            size="x-large"
            start
          />
          <i18n-t
            keypath="firstSteps.webinar"
            tag="span"
            scope="global"
          >
            <a
              :href="links.webinar"
              target="_blank"
            >
              <strong>{{ t('webinar') }}</strong>
            </a>
          </i18n-t>
        </v-card-text>

        <v-card-text>
          <v-icon
            :icon="mdiForumOutline"
            size="x-large"
            start
          />
          <i18n-t
            keypath="firstSteps.forum"
            tag="span"
            scope="global"
          >
            <a
              :href="links.forum"
              target="_blank"
            >
              <strong>{{ t('forum') }}</strong>
            </a>
          </i18n-t>
        </v-card-text>

        <v-divider />

        <v-card-text>
          <v-checkbox
            v-model="showAtStartup"
            :label="t('checkboxLabel')"
          />
          {{ t('hint') }}
        </v-card-text>
      </BaseCard>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import {
  mdiCableData,
  mdiForumOutline,
  mdiSchoolOutline,
  mdiYoutubeTv,
  mdiInformationOutline,
  mdiHelpCircleOutline
} from '@mdi/js';

import { StorageSerializers, useStorage } from '@vueuse/core';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';

import { getFirstDomainDomaindId } from '~/lib/utils';
import { useQueryClient } from '@tanstack/vue-query';
import { useQuery, useQuerySync } from '~~/composables/api/utils/query';
import { useMutation } from '~~/composables/api/utils/mutation';

import { VeoAlertType } from '~/types/VeoTypes';
import { useVeoUser } from '~/composables/VeoUser';


const { t } = useI18n();

const router = useRouter();
const queryClient = useQueryClient();

const { createLink } = useCreateLink();
const { displayErrorMessage} = useVeoAlerts();

const { userSettings } = useVeoUser();

const links = ref({
  forum: 'https://forum.verinice.com',
  webinar: 'https://verinice.com/webinare',
  youtube: 'https://www.youtube.com/playlist?list=PLYG8Ez-PzQxtY660HESHsyD9sultD1ldf'
});

const firstSetpsCompleted = useStorage(LOCAL_STORAGE_KEYS.FIRST_STEPS_COMPLETED, true, localStorage, { serializer: StorageSerializers.boolean });

const showAtStartup = computed({
  get: () => !firstSetpsCompleted.value,
  set: (newValue: boolean) => firstSetpsCompleted.value = !newValue
});

// *********************************************************************************
const { data: units } = useQuery(unitQueryDefinitions.queries.fetchAll);
const maxUnitsExceeded = computed(() => (units.value?.length || 0) >= userSettings.value.maxUnits);

const { mutateAsync: create, data: unitPropsPayload } = useMutation(unitQueryDefinitions.mutations.create);
const { mutateAsync: apply, isLoading } = useMutation(domainQueryDefinitions.mutations.applyProfile);

const { data: domains } = useQuery(domainQueryDefinitions.queries.fetchDomains);

const createUnit = async () => {
  try {
    await create({
      name: domains.value?.[0].profiles.demoUnit.name,
      description: domains.value?.[0].profiles.demoUnit.description,
      domains: (domains.value || []).map((domain) => createLink('domains', domain.id))
    });

    const unit = await useQuerySync(unitQueryDefinitions.queries.fetch, { id: unitPropsPayload.value?.resourceId as string }, queryClient);
    const domainId = getFirstDomainDomaindId(unit);

    if (domainId && unit.id) {
      await apply({ domainId, unitId: unit.id, profileKey: ['demoUnit'] });

      router.push({
        name: 'unit-domains-domain',
        params: {
          unit: unit.id,
          domain: domainId
        }
      });
    }
  } catch (error: any) {
    displayErrorMessage('Error', error.message);
  }
};
</script>

<i18n>
  {
    "en": {
      "applyProfile": "Applying sample data. Please be patient ...",
      "channel": "YouTube channel",
      "checkboxLabel": "Show at startup",
      "documentation": "online documentation",
      "forum": "verinice.forum",
      "goto": "Goto unit selection",
      "greeting": "Welcome to",
      "headline": "First steps",
      "hint": "You can access this page again at any time via the account button!",
      "intro": "In this section you will find suggestions from the verinice.team to get you started quickly:",
      "requestForDeletion": "You have reached the maximum amount of units.
        To enable the sample profile again, you have to delete an existing unit first.",
      "sampledata": "sample data",
      "sampleDataButtonLabel": "Load sample data now",
      "tutorial": "tutorials",
      "webinar": "webinars"
    },
    "de": {
      "applyProfile": "Beispieldaten werden geladen ...",
      "channel": "YouTube Kanal",
      "checkboxLabel": "Beim Start anzeigen",
      "documentation": "Online-Dokumentation",
      "forum": "verinice.forum",
      "greeting": "Willkommen bei",
      "goto": "Zur Unit-Auswahl",
      "headline": "Erste Schritte",
      "hint": "Sie können diese Seite jederzeit über den Account Button erneut aufrufen!",
      "intro": "Im diesem Abschnitt finden Sie Anregungen des verinice.Teams, die Ihnen einen schnellen Einstieg ermöglichen:",
      "requestForDeletion": "Sie haben die maximale Anzahl an Units erreicht.
        Um das Anwenden des Demoprofils wieder zu aktivieren, müssen Sie zunächst eine bestehende Unit löschen.",
      "sampledata": "Beispieldaten",
      "sampleDataButtonLabel": "Beispieldaten jetzt laden",
      "tutorial": "Tutorials",
      "webinar": "Webinaren registrieren"
    }
  }
  </i18n>
