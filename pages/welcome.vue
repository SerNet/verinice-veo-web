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
    <BaseContainer>
      <BaseCard class="bg-basepage">
        <v-card class="my-2 bg-surface">
          <div class="bg-accent" style="height: 75px">
            <v-card-title class="ml-8 small-caps">
              <strong>{{ t('greeting') }}</strong>
            </v-card-title>

            <v-card-subtitle class="ml-8">
              {{ t('subTitle') }}
            </v-card-subtitle>
          </div>

          <v-row class="mx-6 mt-3 small-caps">
            <v-col>
              <v-card-title>
                {{ t('headline') }}
              </v-card-title>
            </v-col>
          </v-row>

          <v-row dense class="ma-8 mt-4">
            <v-col v-for="(step, index) in ['name', 'profile', 'domain', 'summary']" :key="index" md="6">
              <v-card class="mx-2 fill-height bg-background">
                <v-card-title class="pt-4 bg-accent small-caps" style="min-height: 60px">
                  <v-chip class="mr-3" label color="red">
                    <span>{{ index + 1 }}</span>
                  </v-chip>
                  <span>{{ t(`step.${step}`) }}</span>
                </v-card-title>

                <v-card-text class="bg-background ma-8">
                  <v-row class="mb-4 text-h5">{{ t(`explanation.${step}`) }}</v-row>
                  <v-divider class="mb-4" />
                  <v-row
                    ><em class="mt-2">{{ t(`hint.${step}`) }}</em></v-row
                  >
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="d-flex justify-center my-4">
            <v-btn
              v-if="!maxUnitsExceeded"
              color="primary"
              :disabled="maxUnitsExceeded"
              style="width: 200px"
              to="/units/create"
            >
              {{ t('unitCreation') }}
            </v-btn>

            <BaseAlert
              v-else
              :model-value="true"
              :buttons="[{ text: t('goto'), onClick: navigateToUnits }]"
              :title="t('requestHeadline')"
              :type="VeoAlertType.INFO"
              class="mx-14 my-2"
              flat
              no-close-button
            >
              {{ t('requestForDeletion') }}
            </BaseAlert>
          </v-row>

          <v-row>
            <v-col class="text-center my-4">
              <em>{{ t('footer') }}</em>
              &nbsp;&nbsp;
              <nuxt-link
                class="text-decoration-none text-primary"
                rel="noopener noreferrer"
                target="_blank"
                :to="links.portal[locale] ?? links.portal.en"
              >
                <strong>{{ t('portal') }}!</strong>
              </nuxt-link>
            </v-col>
          </v-row>

          <v-divider class="mx-4" />

          <!-- Links / Timeline -->
          <v-row dense>
            <v-timeline
              align="center"
              class="ma-4 mt-12"
              density="compact"
              :direction="isMediumScreen ? 'vertical' : 'horizontal'"
            >
              <v-timeline-item dot-color="primary" size="x-large" :icon="mdiInformationOutline">
                <v-card-text>
                  <v-col cols="12">
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
                  <v-col cols="12">
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
            <v-timeline
              align="center"
              class="mx-4"
              density="compact"
              :direction="isMediumScreen ? 'vertical' : 'horizontal'"
            >
              <v-timeline-item dot-color="primary" size="x-large" :icon="mdiForumOutline">
                <v-card-text>
                  <v-col cols="12">
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
                  <v-col cols="12">
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
                  <v-col cols="12">
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
    </BaseContainer>
  </BasePage>
</template>

<script setup lang="ts">
import { mdiHelpCircleOutline, mdiForumOutline, mdiSchoolOutline, mdiYoutubeTv, mdiInformationOutline } from '@mdi/js';

import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { useQuery } from '~~/composables/api/utils/query';

const { userSettings } = useVeoUser();
import { VeoAlertType } from '~/types/VeoTypes';
import { useDisplay } from 'vuetify';
const { data: units } = useQuery(unitQueryDefinitions.queries.fetchAll);

const maxUnitsExceeded = computed(() => (units.value?.length || 0) >= userSettings.value.maxUnits);

const context = useNuxtApp();
const { t, locale } = useI18n();

// Breakpoints
const { mdAndDown } = useDisplay();
const isMediumScreen = computed(() => mdAndDown.value);

// external links
const links = ref({
  channel: 'https://www.youtube.com/playlist?list=PLYG8Ez-PzQxtY660HESHsyD9sultD1ldf',
  forum: 'https://forum.verinice.com',
  portal: {
    de: 'https://account.verinice.com/',
    en: 'https://account.verinice.com/en/'
  },
  webinar: {
    de: 'https://verinice.com/webinare',
    en: 'https://verinice.com/en/pro/webinars-1'
  }
});

function navigateToUnits() {
  navigateTo('/units');
}
</script>

<i18n src="~/locales/base/pages/units-create.json"></i18n>
