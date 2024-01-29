<!--
   - verinice.veo web
   - Copyright (C) 2024 Frank Schneider
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

    <v-container fluid>
      <BaseCard
        class="mx-12 my-4 bg-basepage"
        style="max-width: 1280px"
      >
        <v-card
          class="my-4 bg-surface"
        >
          <div
            class="bg-accent"
            style="height: 75px"
          >
            <v-card-title class="ml-4 small-caps">
              {{ t('greeting') }}
            </v-card-title>

            <v-card-subtitle class="ml-4">
              {{ t('subTitle') }}
            </v-card-subtitle>
          </div>

          <!-- Decisions: load a profile or an empty unit -->
          <v-row
            dense
            class="mt-8 mb-12"
          >
            <v-col cols="6">
              <v-card class="mx-8 fill-height bg-background">
                <v-card-title
                  class="pt-4 bg-accent small-caps"
                  style="min-height: 60px;"
                >
                  {{ t('selection.noob.question') }}
                </v-card-title>

                <v-card-text class="mt-8 text-center text-h3">
                  {{ isUnitExisting('Demo') ? t('selection.noob.advice') :t('selection.noob.adviceNoUnit') }}
                </v-card-text>

                <div class="d-flex justify-center my-4">
                  <v-btn
                    v-if="!isLoading"
                    :disbaled="isLoading"
                    color="primary"
                    @click="applyProfile()"
                  >
                    <span>
                      {{ isUnitExisting('Demo') ? t('selection.noob.buttonCaption') : t('unitManagement') }}
                    </span>
                  </v-btn>
                  <v-progress-linear
                    v-else
                    color="primary"
                    height="30"
                    :indeterminate="isLoading"
                  >
                    <span class="small-caps text-h2">{{ t('applyProfile') }}</span>
                  </v-progress-linear>
                </div>
              </v-card>
            </v-col>

            <v-col cols="6">
              <v-card class="mr-8 fill-height bg-background">
                <v-card-title
                  class="pt-4 bg-accent small-caps"
                  style="min-height: 60px;"
                >
                  {{ t('selection.seasoned.question') }}
                </v-card-title>

                <v-card-text class="mt-8 text-center text-h3">
                  {{ isUnitExisting('Unit 1') ? t('selection.seasoned.advice') : t('selection.seasoned.adviceNoUnit') }}
                </v-card-text>

                <div class="d-flex justify-center my-8">
                  <v-btn
                    color="primary"
                    @click="loadUnit()"
                  >
                    {{ isUnitExisting('Unit 1') ? t('selection.seasoned.buttonCaption') : t('unitManagement') }}
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Links / Timeline -->
          <v-row dense>
            <v-timeline
              align="center"
              class="ma-4 mt-12"
              density="compact"
              direction="horizontal"
            >
              <v-timeline-item
                dot-color="primary"
                size="x-large"
                :icon="mdiInformationOutline"
              >
                <v-card-text>
                  <v-col
                    cols="12"
                    class="text-justify"
                  >
                    <i18n-t
                      keypath="firstSteps.tutorial"
                      tag="span"
                      scope="global"
                    >
                      <span class="text-decoration-none">
                        <strong>{{ t('injector.tutorial') }}</strong>
                      </span>
                    </i18n-t>
                  </v-col>
                </v-card-text>
              </v-timeline-item>

              <v-timeline-item
                dot-color="primary"
                size="x-large"
                :icon="mdiHelpCircleOutline"
              >
                <v-card-text>
                  <v-col
                    cols="12"
                    class="text-justify"
                  >
                    <i18n-t
                      keypath="firstSteps.documentation"
                      tag="span"
                      scope="global"
                    >
                      <nuxt-link
                        class="text-decoration-none text-primary"
                        rel="noopener noreferrer"
                        target="_blank"
                        to="/docs/index"
                      >
                        <strong>{{ t('injector.documentation') }}</strong>
                      </nuxt-link>
                    </i18n-t>
                  </v-col>
                </v-card-text>
              </v-timeline-item>
            </v-timeline>
          </v-row>
          <!-- external Links -->
          <v-row dense>
            <v-timeline
              align="center"
              class="mx-4"
              density="compact"
              direction="horizontal"
            >
              <v-timeline-item
                dot-color="primary"
                size="x-large"
                :icon="mdiForumOutline"
              >
                <v-card-text>
                  <v-col
                    cols="12"
                    class="text-justify"
                  >
                    <i18n-t
                      keypath="firstSteps.forum"
                      tag="span"
                      scope="global"
                    >
                      <nuxt-link
                        class="text-decoration-none text-primary"
                        rel="noopener noreferrer"
                        target="_blank"
                        :to="links.forum"
                      >
                        <strong>{{ t('injector.forum') }}</strong>
                      </nuxt-link>
                    </i18n-t>
                  </v-col>
                </v-card-text>
              </v-timeline-item>

              <v-timeline-item
                dot-color="primary"
                size="x-large"
                :icon="mdiYoutubeTv"
              >
                <v-card-text>
                  <v-col
                    cols="12"
                    class="text-justify"
                  >
                    <i18n-t
                      keypath="firstSteps.channel"
                      tag="span"
                      scope="global"
                    >
                      <nuxt-link
                        class="text-decoration-none text-primary"
                        rel="noopener noreferrer"
                        target="_blank"
                        :to="links.channel"
                      >
                        <strong>{{ t('injector.channel') }}</strong>
                      </nuxt-link>
                    </i18n-t>
                  </v-col>
                </v-card-text>
              </v-timeline-item>

              <v-timeline-item
                dot-color="primary"
                size="x-large"
                :icon="mdiSchoolOutline"
              >
                <v-card-text>
                  <v-col
                    cols="12"
                    class="text-justify"
                  >
                    <i18n-t
                      keypath="firstSteps.webinar"
                      tag="span"
                      scope="global"
                    >
                      <nuxt-link
                        class="text-decoration-none text-primary"
                        rel="noopener noreferrer"
                        target="_blank"
                        :to="locale === 'de' ? links.webinar.de : links.webinar.en"
                      >
                        <strong>{{ t('injector.webinar') }}</strong>
                      </nuxt-link>
                    </i18n-t>
                  </v-col>
                </v-card-text>
              </v-timeline-item>
            </v-timeline>
          </v-row>

          <v-divider />

          <v-card-text class="text-center">
            <span>{{ t('reminder') }}</span>
          </v-card-text>
        </v-card>
      </BaseCard>
    </v-container>
  </BasePage>
</template>

<script setup lang="ts">
import {
  mdiHelpCircleOutline,
  mdiForumOutline,
  mdiSchoolOutline,
  mdiYoutubeTv,
  mdiInformationOutline
} from '@mdi/js';

import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { useQuery } from '~/composables/api/utils/query';
import { useMutation } from '~/composables/api/utils/mutation';

import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

const { mutateAsync: apply, isLoading } = useMutation(domainQueryDefinitions.mutations.applyProfile);
const { displayErrorMessage } = useVeoAlerts();

const router = useRouter();
const { t, locale } = useI18n();

// fetch all client units
const { data: units } = useQuery(unitQueryDefinitions.queries.fetchAll);

// get unit- and domain-id according to the param given: <Demo> || <Unit 1>
const routeIds = (unitName: any) => {
  const unit = units.value?.find((unit: any) => unit.name === unitName);
  // get the DS-GVO-Id of the unit's allocated domains
  const domain = unit?.domains?.find((domain: any) => domain.name === 'DS-GVO');

  return [unit?.id, domain?.id];
};
// point the router to the dashboard of the unit given
const loadUnit = (unitname = 'Unit 1') => {
  if (!isUnitExisting(unitname)) {
    router.push({ name: 'units' });
  }

  const [unit, domain] = [...routeIds(unitname)];

  if (unit && domain) {
    // link to the dashboard
    router.push({
      name: 'unit-domains-domain',
      params: {
        unit,
        domain
      }
    });
  }
};

const applyProfile = async () => {
  // navigate to indexpage if the UNIT 'Demo' has been renamed or deleted
  if (!isUnitExisting('Demo')) {
    router.push({ name: 'units' });
  }
  const isProfileApplied = localStorage.getItem(LOCAL_STORAGE_KEYS.DEMO_UNIT_PROFILE_APPLIED);
  // navigate to the dashboard if the profile already has been applied
  if (isProfileApplied) {
    loadUnit('Demo');
  }

  const [unit, domain] = [...routeIds('Demo')];

  if (unit && domain) {
    try {
      // set DEMO_UNIT_PROFILE_APPLIED to true on first call to ensure, that the profile is applied only once
      localStorage.setItem(LOCAL_STORAGE_KEYS.DEMO_UNIT_PROFILE_APPLIED, true.toString());
      // apply the profile / sample data to the unit <Demo>
      await apply({ domainId: domain, unitId: unit, profileKey: ['demoUnit'] });
      // link to the dashboard
      loadUnit('Demo');
    }
    catch (error: any) {
      displayErrorMessage('Error', t('errorMessage'));
    }
  }
};

const isUnitExisting = (unitName: any) => units.value?.find((unit: any) => unit.name === unitName);

// external links
const links = ref({
  channel: 'https://www.youtube.com/playlist?list=PLYG8Ez-PzQxtY660HESHsyD9sultD1ldf',
  forum: 'https://forum.verinice.com',
  webinar: {
    de: 'https://verinice.com/webinare',
    en: 'https://verinice.com/en/pro/webinars-1'
  }
});

// prevent the welcome page to be loaded automatically at login (except for the first time; handled by the middleware)
localStorage.setItem(LOCAL_STORAGE_KEYS.SHOW_WELCOME_PAGE, 'false');
</script>

<i18n>
  {
    "en": {
      "applyProfile": "Profile is applying...",
      "errorMessage": "Could not apply profile!",
      "greeting": "Welcome!",
      "headline": "First steps",
      "injector": {
        "channel": "YouTube channel",
        "documentation": "documentation",
        "forum": "verinice.forum",
        "profile": "profiles",
        "tutorial": "tutorials",
        "webinar": "webinars"
      },
      "reminder": "You can call up this page again at any time using the account button!",
      "selection": {
        "noob": {
            "question": "Are you new to verinice and want to find your way around?",
            "advice": "Download a sample organization to get to know all the functions ...",
            "adviceNoUnit": "Create a sample organization ...",
            "buttonCaption": "Load example data"
        },
        "seasoned": {
            "question": "You want to get started right away?",
            "advice": "Load an empty unit and map your organization ...",
            "adviceNoUnit": "Select a unit ...",
            "buttonCaption": "Load empty unit"
        }
      },
      "subTitle": "Your first steps in verinice:",
      "unitManagement": "Goto unit management"
    },
    "de": {
      "applyProfile": "Profil wird geladen ...",
      "errorMessage": "Profil konnte nicht angewendet werden!",
      "greeting": "Willkommen!",
      "headline": "Erste Schritte",
      "injector": {
        "channel": "YouTube Channel",
        "documentation": "Dokumentation",
        "forum": "verinice.forum",
        "profile": "Profile",
        "tutorial": "Tutorials",
        "webinar": "Webinaren"
      },
      "reminder": "Sie können diese Seite jederzeit über den Account Button erneut aufrufen!",
      "selection": {
        "noob": {
            "question": "Sie sind neu in verinice und möchten sich orientieren?",
            "advice": "Laden Sie eine Beispielorganisation um alle Funktionen kennenzulernen ...",
            "adviceNoUnit": "Legen Sie eine Beispielorganisation an ...",
            "buttonCaption": "Beispielorganisation laden"
        },
        "seasoned": {
            "question": "Sie kennen sich bereits aus und möchten direkt starten?",
            "advice": "Laden Sie eine leere Unit und bilden Sie Ihre Organisation ab ...",
            "adviceNoUnit": "Wählen Sie eine Unit aus ...",
            "buttonCaption": "Leere Unit laden"
        }
      },
      "subTitle": "Ihre ersten Schritte in verinice:",
      "unitManagement": "Zur Unit-Verwaltung wechseln"
    }
  }
</i18n>
