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

    <BaseCard class="ma-12">
      <v-container fluid>
        <v-row dense>
          <BaseCard>
            <v-card-title class="small-caps">
              {{ t('greeting') }}
            </v-card-title>
            <v-card-subtitle>
              {{ t('subTitle') }}
            </v-card-subtitle>
          </BaseCard>
        </v-row>

        <v-row class="mx-auto mt-12">
          <v-col cols="6">
            <p>
              {{ t('selection.noob.question') }}
            </p>
          </v-col>
          <v-col>
            <p>
              {{ t('selection.seasoned.question') }}
            </p>
          </v-col>
        </v-row>

        <v-row class="mx-auto">
          <v-col cols="6">
            <v-card class="pa-8 bg-accent">
              <v-card class="pa-8 bg-surface">
                <p>{{ t('selection.noob.advice') }}</p>
              </v-card>

              <div class="d-flex justify-center">
                <v-btn
                  class="mt-4"
                  color="primary"
                >
                  {{ t('selection.noob.buttonCaption') }}
                </v-btn>
              </div>
            </v-card>
          </v-col>

          <v-col cols="6">
            <v-card class="pa-8 bg-accent">
              <v-card class="pa-8 bg-surface">
                <p>{{ t('selection.seasoned.advice') }}</p>
              </v-card>

              <div class="d-flex justify-center">
                <v-btn
                  class="mt-4"
                  color="primary"
                >
                  {{ t('selection.seasoned.buttonCaption') }}
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <div class="d-flex justify-center my-12">
        <v-row dense>
          <p class="mx-auto">
            {{ t('hints.profile') }}
          </p>
        </v-row>
      </div>

      <div>
        <v-row dense>
          <p class="mx-auto">
            {{ t('hints.docs') }}
          </p>
        </v-row>
        <v-row dense>
          <p class="mx-auto">
            {{ t('hints.externalLinks') }}
          </p>
        </v-row>
      </div>

      <div class="d-flex justify-center">
        <v-row dense>
          <p class="mx-auto my-12">
            {{ t('hints.reminder') }}
          </p>
        </v-row>
      </div>
    </BaseCard>
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
      "documentation": "documentation",
      "forum": "verinice.forum",
      "greeting": "Welcome!",
      "headline": "First steps",
      "hints": {
        "profile": "In the Profiles area, you can load further sample data or load it as a template into your productive unit.",
        "docs": "You can find out more about how to use verinice in the documentation (?), the tutorials (i) will help you find your way around quickly.",
        "externalLinks": "Further information can be found in the verinice.forum, on our YouTube channel and in our free webinars.",
        "reminder": "You can call up this page again at any time using the account button!"
      },
      "profile": "profiles",
      "selection": {
        "noob": {
            "question": "Are you new to verinice and want to find your way around?",
            "advice": "Download a sample organization to get to know all the functions ...",
            "buttonCaption": "Load example data"
        },
        "seasoned": {
            "question": "You already know your way around and want to get started right away?",
            "advice": "Load an empty unit and map your organization ...",
            "buttonCaption": "Load empty unit"
        }
      },
      "subTitle": "Your first steps in verinice:",
      "tutorial": "tutorials",
      "webinar": "webinars"
    },
    "de": {
      "channel": "YouTube Kanal",
      "documentation": "Dokumentation",
      "forum": "verinice.forum",
      "greeting": "Willkommen!",
      "headline": "Erste Schritte",
      "hints": {
        "profile": "Im Bereich Profile können Sie weitere Beispieldaten laden oder diese als Vorlage in Ihre produktive Unit laden.",
        "docs": "Mehr zur Bedienung von verinice finden Sie in der Dokumentation (?), die Tutorials (i) helfen bei der schnellen Orientierung.",
        "externalLinks": "Weitergehende Informationen finden Sie im verinice.forum, auf unserem YouTube Kanal und in unseren kostenlosen Webinaren.",
        "reminder": "Sie können diese Seite jederzeit über den Account Button erneut aufrufen!"
      },
      "profile": "Profile",
      "selection": {
        "noob": {
            "question": "Sie sind neu in verinice und möchten sich orientieren?",
            "advice": "Laden Sie eine Beispielorganisation um alle Funktionen kennenzulernen ...",
            "buttonCaption": "Beispielorganisation laden"
        },
        "seasoned": {
            "question": "Sie kennen sich bereits aus und möchten direkt starten?",
            "advice": "Laden Sie eine leere Unit und bilden Sie Ihre Organisation ab ...",
            "buttonCaption": "Leere Unit laden"
        }
      },
      "subTitle": "Ihre ersten Schritte in verinice:",
      "tutorial": "Tutorials",
      "webinar": "Webinaren"
    }
  }
</i18n>
