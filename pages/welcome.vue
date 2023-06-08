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
          />
          &nbsp;&nbsp;{{ t('tutorials') }}
        </v-card-text>

        <v-card-text>
          <v-icon
            :icon="mdiHelpCircleOutline"
            size="x-large"
          />  
          &nbsp;&nbsp;{{ t('documentation') }}
        </v-card-text>

        <v-card-text>
          <v-icon
            :icon="mdiCableData"
            size="x-large"
          />
          &nbsp;&nbsp;{{ t('demodata') }}
        </v-card-text>

        <v-layout class="mb-4 justify-center">
          <v-btn
            color="primary"
            elevation="2"
            :prepend-icon="mdiCableData"
            size="large"
            to="/"
            variant="flat"
          >
            {{ t('buttoncaption') }}
          </v-btn>
        </v-layout>

        <v-divider />

        <v-card-text>
          <v-icon
            :icon="mdiYoutubeTv"
            size="x-large"
          />
          &nbsp;&nbsp;{{ t('channel') }}
          <a
            :href="links.youtube"
            target="_blank"
          >
            <strong>verinice@Youtube</strong>
          </a>
        </v-card-text>

        <v-card-text>
          <v-icon
            :icon="mdiSchoolOutline"
            size="x-large"
          />
          &nbsp;&nbsp;{{ t('webinars') }}
          <a
            :href="links.webinar"
            target="_blank"
          >
            <strong>Webinar</strong>
          </a>
        </v-card-text>

        <v-card-text>
          <v-icon
            :icon="mdiForumOutline"
            size="x-large"
          />
          &nbsp;&nbsp;{{ t('forum') }}
          <a
            :href="links.forum"
            target="_blank"
          >
            <strong>Forum</strong>
          </a>
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

const { t } = useI18n();

const links = ref({
  forum: 'https://forum.verinice.com',
  webinar: 'https://verinice.com/webinare',
  youtube: 'https://www.youtube.com/playlist?list=PLYG8Ez-PzQxtY660HESHsyD9sultD1ldf'
});
const firstSetpsCompleted = useStorage(LOCAL_STORAGE_KEYS.FIRST_STEPS_COMPLETED, true, localStorage, { serializer: StorageSerializers.boolean });

const showAtStartup = computed({
  get: () => !firstSetpsCompleted.value,
  set(newValue: boolean) {
    firstSetpsCompleted.value = !newValue;
  }
});
</script>

<i18n>
  {
    "en": {
      "buttoncaption": "Load Demo data now",
      "channel": "In our *YouTube channel* you can find videos about verinice.veo:",
      "checkboxLabel": "Show at startup",
      "demodata": "The *demo data* contains a complete sample organization. You can modify the content as you wish to get to know all the features and functions or use it directly as a basis for mapping your organization.",
      "documentation": "The *online documentation* describes in detail all functions of verinice.veo and explains the technical aspects. You can open the *online documentation* at any time via the icon in the application bar on the top right.",
      "forum": "In the *verinice.forum* you will find further information and can participate in the lively exchange with other users:",
      "greeting": "Welcome to",
      "headline": "First steps",
      "hint": "You can access this page again at any time via the *Getting started* account button!",
      "intro": "In this section you will find suggestions from the verinice.team to get you started quickly:",
      "tutorials": "For quick orientation, contextual *tutorials* are available on each page. Available *tutorials* can be accessed at any time via the icon in the application bar at the top right.",
      "webinars": "You can register for our regular free *webinars* at the following link:"
    },
    "de": {
      "buttoncaption": "Demodaten jetzt laden",
      "channel": " In unserem *YouTube channel* finden Sie Videos zu verinice.veo:",
      "checkboxLabel": "Beim Start anzeigen",
      "demodata": "Die *Demodaten* beinhalten eine komplette Beispielorganisation. Sie können die Inhalte nach Belieben ändern um alle Features und Funktionen kennen zu lernen oder direkt als Basis für die Abbildung Ihrer Organisation verwenden.",
      "documentation": "Die *Online-Dokumentation* beschreibt ausführlich alle Funktionen von verinice.veo und erläutert die technischen Aspekte. Sie können die *Online-Dokumentation* jederzeit über das Symbol in der Anwendungsleiste rechts oben öffnen.",
      "forum": "Im *verinice.Forum* finden Sie weitergehende Informationen und können am regen Austausch mit anderen Anwenderinnen und Anwendern teilnehmen:",
      "greeting": "Willkommen bei",
      "headline": "Erste Schritte",
      "hint": "Sie können diese Seite jederzeit über den Account Button *Erste Schritte* erneut aufrufen!",
      "intro": "Im diesem Abschnitt finden Sie Anregungen des verinice.Teams, die Ihnen einen schnellen Einstieg ermöglichen:",
      "tutorials": "Zur schnellen Orientierung stehen auf jeder Seite kontextbezogene *Tutorials* zur Verfügung. Verfügbare *Tutorials* können Sie jederzeit über das Symbol in der Anwendungsleiste rechts oben aufrufen.",
      "webinars": "Zu unseren regelmäßigen kostenlosen *Webinaren* können Sie sich unter folgendem Link anmelden:"
    }
  }
  </i18n>
