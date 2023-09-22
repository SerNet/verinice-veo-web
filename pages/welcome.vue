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
  <BasePage
    data-test-selector="welcome-page"
  >
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

        <v-card-text v-if="profileLink">
          <v-col class="text-justify">
            <v-icon
              :icon="mdiShapeOutline"
              size="x-large"
              start
            />
            <i18n-t
              keypath="firstSteps.profile"
              tag="span"
              scope="global"
            >
              <nuxt-link
                :to="profileLink"
                style="text-decoration: none;"
              >
                <strong>{{ t('profile') }}</strong>
              </nuxt-link>
            </i18n-t>
          </v-col>
        </v-card-text>

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
  mdiForumOutline,
  mdiSchoolOutline,
  mdiShapeOutline,
  mdiYoutubeTv,
  mdiInformationOutline,
  mdiHelpCircleOutline,
  mdiThemeLightDark
} from '@mdi/js';

import { useStorage } from '@vueuse/core';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { useQuery } from '~/composables/api/utils/query';

const { t } = useI18n();

const links = ref({
  forum: 'https://forum.verinice.com',
  webinar: 'https://verinice.com/webinare',
  youtube: 'https://www.youtube.com/playlist?list=PLYG8Ez-PzQxtY660HESHsyD9sultD1ldf'
});

// useStorage ignores defaults, if a value is already present in local storage
const showWelcomePage = useStorage(LOCAL_STORAGE_KEYS.SHOW_WELCOME_PAGE, false);

// toggle the cookie value via setter
const showAtStartup = computed({
  get: () => showWelcomePage.value,
  set: (newValue: boolean) => showWelcomePage.value = newValue
});

// fetch all domains and units
const { data: domains} = useQuery(domainQueryDefinitions.queries.fetchDomains);
const { data: units } = useQuery(unitQueryDefinitions.queries.fetchAll);

const domainId = computed(() => domains.value?.filter((domain) => domain.profiles && Object.keys(domain.profiles).length)?.[0]?.id || null);
const unitId = computed(() => units.value?.[0]?.id || null);

const profileLink = computed(() => domainId && unitId
  ? `/${unitId.value}/domains/${domainId.value}/profiles`
  : null
);
</script>

<i18n>
  {
    "en": {
      "channel": "YouTube channel",
      "checkboxLabel": "Show at startup",
      "documentation": "online documentation",
      "forum": "verinice.forum",
      "headline": "First steps",
      "hint": "You can access this page again at any time via the account button!",
      "intro": "In this section you will find suggestions from the verinice.team to get you started quickly:",
      "profile": "profile",
      "tutorial": "tutorials",
      "webinar": "webinars"
    },
    "de": {
      "channel": "YouTube Kanal",
      "checkboxLabel": "Beim Start anzeigen",
      "documentation": "Online-Dokumentation",
      "forum": "verinice.forum",
      "headline": "Erste Schritte",
      "hint": "Sie können diese Seite jederzeit über den Account Button erneut aufrufen!",
      "intro": "Im diesem Abschnitt finden Sie Anregungen des verinice.Teams, die Ihnen einen schnellen Einstieg ermöglichen:",
      "profile": "Profil",
      "tutorial": "Tutorials",
      "webinar": "Webinaren registrieren"
    }
  }
</i18n>
