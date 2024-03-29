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
        style="width: 35%; max-width: 720px; min-width: 480px;"
      >
        <v-card-title>
          <span class="mx-2">{{ t('greeting') }}</span>

          <div
            class="mx-8 d-flex"
            style="height: 75px; width: 300px;"
          >
            <LayoutAppLogoDesktop />
          </div>
        </v-card-title>

        <v-card-subtitle class="mt-8">
          <v-row class="">
            <v-col class="mx-4 text-h4">
              {{ t('headline') }}
            </v-col>

            <v-col class="pt-0">
              <v-checkbox
                v-model="showAtStartup"
                :label="t('checkboxLabel')"
              />
            </v-col>
          </v-row>
        </v-card-subtitle>

        <v-card-text>
          <v-col class="text-justify">
            {{ t('intro') }}
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
                  rel="noopener noreferrer"
                  target="_blank"
                  to="/docs"
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
          class="mb-4 justify-center"
        >
          <v-btn
            v-if="!maxUnitsExceeded"
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
          <span style="color: white;">{{ t('applyProfile').toUpperCase() }}</span>
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

// toggle the cookie value via setter
const showAtStartup = computed({
  get: () => !firstSetpsCompleted.value,
  set: (newValue: boolean) => firstSetpsCompleted.value = !newValue
});

// fetch all domains and units
const { data: domains } = useQuery(domainQueryDefinitions.queries.fetchDomains);
const { data: units } = useQuery(unitQueryDefinitions.queries.fetchAll);

// determine the ratio between the available units and the restrictions set via keyCloak (maxUnits allowed)
const maxUnitsExceeded = computed(() => (units.value?.length || 0) >= userSettings.value.maxUnits);

// mutations
const { mutateAsync: create, data: unitPropsPayload } = useMutation(unitQueryDefinitions.mutations.create);
const { mutateAsync: apply, isLoading } = useMutation(domainQueryDefinitions.mutations.applyProfile);

const createUnit = async () => {
  try {
    await create({
      // name and description still hardcoded, since atm there is the DS-GVO only
      // providing a fallback for name and description, if the API call fails for whatever reason
      name: domains.value?.[0].profiles?.demoUnit?.name || 'Sample Unit',
      description: domains.value?.[0].profiles?.demoUnit?.description || 'A sample data organization',
      domains: (domains.value || []).map((domain) => createLink('domains', domain.id))
    });

    // get unitId and domainId; needed to form a proper route
    const unit = await useQuerySync(unitQueryDefinitions.queries.fetch, { id: unitPropsPayload.value?.resourceId as string }, queryClient);
    const domainId = getFirstDomainDomaindId(unit);

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
      "greeting": "Welcome to",
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
      "greeting": "Willkommen bei",
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
