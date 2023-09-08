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
    <LayoutHeadline
      :title="t('headline')"
    />

    <div class="d-flex justify-center">
      <BaseCard
        class="my-12"
        style="max-width: 500px; min-width: 500px;"
      >
        <v-card-title class="bg-accent">
          <div
            class="mx-4 d-flex"
            style="height: 75px; width: 300px;"
          >
            <LayoutAppLogoDesktop />
          </div>

          <v-card-subtitle class="bg-accent">
            <v-row>
              <v-col cols="6" />
              <v-col>
                <v-checkbox
                  v-model="showAtStartup"
                  :label="t('checkboxLabel')"
                />
              </v-col>
            </v-row>
          </v-card-subtitle>
        </v-card-title>


        <v-card-text>
          <v-col class="mt-8 text-justify">
            {{ t('intro') }}
          </v-col>

          <v-col class="mt-4 text-justify">
            <v-icon
              :icon="mdiThemeLightDark"
              size="x-large"
              start
            />
            <i18n-t
              keypath="firstSteps.mode"
              tag="span"
              scope="global"
            />
          </v-col>

          <v-col class="mt-4 text-justify">
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
          </v-col>
        </v-card-text>

        <v-card-text>
          <v-col class="text-justify">
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
                  class="text-decoration-none text-primary"
                  rel="noopener noreferrer"
                  target="_blank"
                  to="/docs/index"
                >
                  <strong>{{ t('documentation') }}</strong>
                </nuxt-link>
              </template>
            </i18n-t>
          </v-col>
        </v-card-text>

        <v-card-text>
          <v-col class="text-justify">
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
          </v-col>
        </v-card-text>

        <v-layout
          v-if="!maxUnitsExceeded"
          class="mb-4 justify-center"
        >
          <v-btn
            color="primary"
            :disabled="maxUnitsExceeded"
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
          height="40"
          indeterminate
          striped
        >
          <span>{{ t('applyProfile').toUpperCase() }}</span>
        </v-progress-linear>

        <BaseAlert
          v-if="maxUnitsExceeded && !isLoading"
          :model-value="true"
          :buttons="[{ text: t('goto'), onClick: () => navigateTo('/') }]"
          :title="t('requestHeadline')"
          :type="VeoAlertType.INFO"
          class="ma-4"
          flat
          no-close-button
        >
          {{ t('requestForDeletion') }}
        </BaseAlert>

        <v-divider />

        <v-card-text>
          <v-col class="text-justify">
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
                class="text-decoration-none text-primary"
                :href="links.youtube"
                rel="noopener noreferrer"
                target="_blank"
              >
                <strong>{{ t('channel') }}</strong>
              </a>
            </i18n-t>
          </v-col>
        </v-card-text>

        <v-card-text>
          <v-col class="text-justify">
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
                class="text-decoration-none text-primary"
                :href="links.webinar"
                rel="noopener noreferrer"
                target="_blank"
              >
                <strong>{{ t('webinar') }}</strong>
              </a>
            </i18n-t>
          </v-col>
        </v-card-text>

        <v-card-text>
          <v-col class="text-justify">
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
                class="text-decoration-none text-primary"
                :href="links.forum"
                rel="noopener noreferrer"
                target="_blank"
              >
                <strong>{{ t('forum') }}</strong>
              </a>
            </i18n-t>
          </v-col>
        </v-card-text>

        <v-divider />

        <v-card-text>
          <span class="mx-4">{{ t('hint') }}</span>
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
  mdiHelpCircleOutline,
  mdiThemeLightDark
} from '@mdi/js';

import { StorageSerializers, useStorage } from '@vueuse/core';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';

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

// Use storage ignores defaults, if a value is already present in local storage
const showWelcomePage = useStorage(LOCAL_STORAGE_KEYS.SHOW_WELCOME_PAGE, false);

// toggle the cookie value via setter
const showAtStartup = computed({
  get: () => showWelcomePage.value,
  set: (newValue: boolean) => showWelcomePage.value = newValue
});

// fetch all domains and units
const { data: domains } = useQuery(domainQueryDefinitions.queries.fetchDomains);
const { data: units } = useQuery(unitQueryDefinitions.queries.fetchAll);

// determine the ratio between the available units and the restrictions set via keyCloak (maxUnits allowed)
const maxUnitsExceeded = computed(() => (units.value?.length || 0) >= userSettings.value.maxUnits);

// mutations
const { mutateAsync: create, data: unitPropsPayload } = useMutation(unitQueryDefinitions.mutations.create);
const { mutateAsync: apply, isLoading } = useMutation(domainQueryDefinitions.mutations.applyProfile);

const getDomainsContainingProfile = async () => {
  // fetch all domains
  const domains = await useQuerySync(domainQueryDefinitions.queries.fetchDomains, undefined, queryClient);
  // return the domains containing profiles / sample data only
  return domains.filter((domain) => domain.profiles && Object.keys(domain.profiles).length);
};

const createUnit = async () => {
  try {
    const domainsContainingProfile = await getDomainsContainingProfile();

    await create({
      // name and description still hardcoded, since atm there is the DS-GVO only
      // providing a fallback for name and description, if the API call fails for whatever reason
      name: domainsContainingProfile[0].profiles?.demoUnit?.name || 'Sample Unit',
      description: domainsContainingProfile[0].profiles?.demoUnit?.description || 'A sample data organization',
      domains: (domains.value || []).map((domain) => createLink('domains', domain.id))
    });

    // get unitId and domainId; needed to form a proper route
    const unit = await useQuerySync(unitQueryDefinitions.queries.fetch, { id: unitPropsPayload.value?.resourceId as string }, queryClient);
    const domainId = domainsContainingProfile[0].id;

    if (domainId && unit.id) {
      // apply the profile / sample data to the unit recently created
      await apply({ domainId, unitId: unit.id, profileKey: ['demoUnit'] });
      // link to the dashboard
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
      "headline": "First steps",
      "hint": "You can access this page again at any time via the account button!",
      "intro": "In this section you will find suggestions from the verinice.team to get you started quickly:",
      "requestForDeletion": "To enable the sample profile again, you have to delete an existing unit first.",
      "requestHeadline": "Maximum amount of Units reached",
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
      "goto": "Zur Unit-Auswahl",
      "headline": "Erste Schritte",
      "hint": "Sie können diese Seite jederzeit über den Account Button erneut aufrufen!",
      "intro": "Im diesem Abschnitt finden Sie Anregungen des verinice.Teams, die Ihnen einen schnellen Einstieg ermöglichen:",
      "requestForDeletion": "Um das Anwenden des Demoprofils wieder zu aktivieren, müssen Sie zunächst eine bestehende Unit löschen.",
      "requestHeadline": "Maximale Anzahl an Units erreicht",
      "sampledata": "Beispieldaten",
      "sampleDataButtonLabel": "Beispieldaten jetzt laden",
      "tutorial": "Tutorials",
      "webinar": "Webinaren registrieren"
    }
  }
</i18n>
