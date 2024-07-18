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
  <BasePage data-test-selector="welcome-page">
    <v-container fluid>
      <BaseCard class="mx-12 mb-4 bg-basepage" style="max-width: 1280px; min-width: 1280px">
        <v-card class="my-4 bg-surface">
          <div class="bg-accent" style="height: 75px">
            <v-card-title class="ml-8 small-caps">
              {{ t('greeting') }}
            </v-card-title>

            <v-card-subtitle class="ml-8">
              {{ t('subTitle') }}
            </v-card-subtitle>
          </div>

          <v-row class="bg-accent d-flex justify-center mx-11 mt-8 mb-2 small-caps">
            <v-col>
              <v-card-title class="">
                {{ t('headline') }}
              </v-card-title>
            </v-col>
          </v-row>

          <v-row dense class="ma-8 mt-2">
            <v-col v-for="(step, index) in ['name', 'profile', 'domain', 'summary']" :key="step" cols="3">
              <v-card class="mx-2 fill-height bg-background">
                <v-card-title class="pt-4 bg-accent small-caps" style="min-height: 60px">
                  <v-chip class="mr-2" label color="red">{{ index + 1 }}</v-chip
                  >{{ t(`step.${step}`) }}
                </v-card-title>

                <v-card-text class="mt-8 text-center text-h3">
                  {{ t(`explanation.${step}`) }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="d-flex justify-center my-4">
            <v-btn color="primary" to="/units/create" style="width: 200px">{{ t('unitCreation') }}</v-btn>
          </v-row>

          <v-divider class="mx-4" />

          <!-- Links / Timeline -->
          <v-row dense>
            <v-timeline align="center" class="ma-4 mt-12" density="compact" direction="horizontal">
              <v-timeline-item dot-color="primary" size="x-large" :icon="mdiInformationOutline">
                <v-card-text>
                  <v-col cols="12" class="text-justify">
                    <i18n-t keypath="firstSteps.tutorial" tag="span" scope="global">
                      <span class="text-decoration-none">
                        <strong>{{ t('injector.tutorial') }}</strong>
                      </span>
                    </i18n-t>
                  </v-col>
                </v-card-text>
              </v-timeline-item>

              <v-timeline-item dot-color="primary" size="x-large" :icon="mdiHelpCircleOutline">
                <v-card-text>
                  <v-col cols="12" class="text-justify">
                    <i18n-t keypath="firstSteps.documentation" tag="span" scope="global">
                      <nuxt-link
                        class="text-decoration-none text-primary"
                        rel="noopener noreferrer"
                        target="_blank"
                        :to="context.$config.public.documentationUrl"
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
            <v-timeline align="center" class="mx-4" density="compact" direction="horizontal">
              <v-timeline-item dot-color="primary" size="x-large" :icon="mdiForumOutline">
                <v-card-text>
                  <v-col cols="12" class="text-justify">
                    <i18n-t keypath="firstSteps.forum" tag="span" scope="global">
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

              <v-timeline-item dot-color="primary" size="x-large" :icon="mdiYoutubeTv">
                <v-card-text>
                  <v-col cols="12" class="text-justify">
                    <i18n-t keypath="firstSteps.channel" tag="span" scope="global">
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

              <v-timeline-item dot-color="primary" size="x-large" :icon="mdiSchoolOutline">
                <v-card-text>
                  <v-col cols="12" class="text-justify">
                    <i18n-t keypath="firstSteps.webinar" tag="span" scope="global">
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
import { mdiHelpCircleOutline, mdiForumOutline, mdiSchoolOutline, mdiYoutubeTv, mdiInformationOutline } from '@mdi/js';

const context = useNuxtApp();
const { t, locale } = useI18n();

// external links
const links = ref({
  channel: 'https://www.youtube.com/playlist?list=PLYG8Ez-PzQxtY660HESHsyD9sultD1ldf',
  forum: 'https://forum.verinice.com',
  webinar: {
    de: 'https://verinice.com/webinare',
    en: 'https://verinice.com/en/pro/webinars-1'
  }
});
</script>

<i18n>
  {
    "en": {
      "explanation": {
        "name": "Name and description",
        "profile": "Choose profile",
        "domain": "Choose domains",
        "summary": "Summary"
      },
      "greeting": "Welcome!",
      "headline": "Create your first Unit in just four steps ...",
      "injector": {
        "channel": "YouTube channel",
        "documentation": "documentation",
        "forum": "verinice.forum",
        "profile": "profiles",
        "tutorial": "tutorials",
        "webinar": "webinars"
      },
      "reminder": "You can call up this page again at any time using the account button!",
      "step": {
        "name": "Name and description",
        "profile": "Choose profile",
        "domain": "Choose domains",
        "summary": "Summary"
      },
      "subTitle": "Your first steps in verinice:",
      "unitCreation": "Create Unit"
    },
    "de": {
      "explanation": {
        "name": "Name and description",
        "profile": "Choose profile",
        "domain": "Choose domains",
        "summary": "Summary"
      },
      "greeting": "Willkommen!",
      "headline": "Erstellen Sie Ihre erste Unit in nur vier Schritten ...",
      "injector": {
        "channel": "YouTube Channel",
        "documentation": "Dokumentation",
        "forum": "verinice.forum",
        "profile": "Profile",
        "tutorial": "Tutorials",
        "webinar": "Webinaren"
      },
      "reminder": "Sie können diese Seite jederzeit über den Account Button erneut aufrufen!",
      "step": {
        "name": "Name und Beschreibung",
        "profile": "Profil auswählen",
        "domain": "Dömänen auswählen",
        "summary": "Zusammenfassung"
      },
      "subTitle": "Ihre ersten Schritte in verinice:",
      "unitCreation": "Unit erstellen"
    }
  }
</i18n>
