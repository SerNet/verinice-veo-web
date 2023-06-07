<template>
  <BasePage>
    <div class="d-flex justify-center">      
      <BaseCard
        class="my-4"
        style="width: 70%; max-width: 1000px;"
      >
        <v-card-title>
          {{ t('greeting') }}
          <div
            class="mx-4 d-flex justify-center"
            style="height: 50px; width: 250px;"
          >
            <LayoutAppLogoDesktop />
          </div>        
        </v-card-title>

        <br><br>
        
        <v-card-subtitle>{{ t('headline') }}</v-card-subtitle><br>

        <v-card-text>
          {{ t('starter') }}<br><br>

          <v-icon
            :icon="mdiHelpCircleOutline"
            size="x-large"
          />
          &nbsp;&nbsp;{{ t('documentation') }}<br><br>

          <v-icon
            :icon="mdiInformationOutline"
            size="x-large"
          />
          &nbsp;&nbsp;{{ t('tutorials') }}<br><br>

          <v-icon
            :icon="mdiYoutubeTv"
            size="x-large"
          />
          &nbsp;&nbsp;{{ t('channel') }}
          <a
            :href="veoVideoLink"
            target="_blank"
          >
            <strong>verinice@Youtube</strong>
          </a><br><br>

          <v-icon
            :icon="mdiSchoolOutline"
            size="x-large"
          />
          &nbsp;&nbsp;{{ t('webinars') }}
          <a
            href="https://verinice.com/webinare"
            target="_blank"
          >
            <strong>Webinar</strong>
          </a><br><br>

          <v-icon
            :icon="mdiForumOutline"
            size="x-large"
          />
          &nbsp;&nbsp;{{ t('forum') }}
          <a
            href="https://forum.verinice.com"
            target="_blank"
          >
            <strong>Forum</strong>
          </a><br><br>

          Die <strong>Demodaten</strong> beinhalten eine komplette Beispielorganisation.
          Sie können die Inhalte nach Belieben ändern um alle Features und Funktionen kennen zu lernen
          oder direkt als Basis für die Abbildung Ihrer Organisation verwenden.<br><br>

          <div
            class="d-flex justify-center"
            style="width: 200px;"
          >
            <LayoutDemoUnitButton />
          </div>
          <br>

          Sie können diese Seite jederzeit über den Account Button <strong>Erste Schritte</strong> erneut aufrufen!<br>
        </v-card-text>
      </BaseCard>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { mdiForumOutline, mdiSchoolOutline, mdiYoutubeTv, mdiInformationOutline, mdiHelpCircleOutline } from '@mdi/js';

const { t } = useI18n();

const veoVideoLink = ref('https://www.youtube.com/playlist?list=PLYG8Ez-PzQxtY660HESHsyD9sultD1ldf');
</script>

<i18n>
  {
    "en": {
      "channel": "In our YouTube channel you can find videos about verinice.veo:",
      "demodata": "The demo data contains a complete sample organization. You can modify the content as you wish to get to know all the features and functions or use it directly as a basis for mapping your organization.",
      "documentation": "The online documentation describes in detail all functions of verinice.veo and explains the technical aspects. You can open the online documentation at any time via the icon in the application bar on the top right.",
      "forum": "In the verinice.forum you will find further information and can participate in the lively exchange with other users:",
      "greeting": "Welcome to",
      "headline": "First steps",
      "hint": "You can access this page again at any time via the Getting Started account button!",
      "starter": "In this section you will find suggestions from the verinice.team to get you started quickly:",
      "tutorials": "For quick orientation, contextual tutorials are available on each page. Available tutorials can be accessed at any time via the icon in the application bar at the top right.",
      "webinars": "You can register for our regular free webinars at the following link:"
    },
    "de": {
      "channel": " In unserem YouTube channel finden Sie Videos zu verinice.veo:",
      "demodata": "Die Demodaten beinhalten eine komplette Beispielorganisation. Sie können die Inhalte nach Belieben ändern um alle Features und Funktionen kennen zu lernen oder direkt als Basis für die Abbildung Ihrer Organisation verwenden.",
      "documentation": "Die Online-Dokumentation beschreibt ausführlich alle Funktionen von verinice.veo und erläutert die technischen Aspekte. Sie können die Online-Dokumentation jederzeit über das Symbol in der Anwendungsleiste rechts oben öffnen.",
      "forum": "Im verinice.Forum finden Sie weitergehende Informationen und können am regen Austausch mit anderen Anwenderinnen und Anwendern teilnehmen:",
      "greeting": "Willkommen bei",
      "headline": "Erste Schritte",
      "hint": "Sie können diese Seite jederzeit über den Account Button Erste Schritte erneut aufrufen!",
      "starter": "Im diesem Abschnitt finden Sie Anregungen des verinice.Teams, die Ihnen einen schnellen Einstieg ermöglichen:",
      "tutorials": "Zur schnellen Orientierung stehen auf jeder Seite kontextbezogene Tutorials zur Verfügung. Verfügbare Tutorials können Sie jederzeit über das Symbol in der Anwendungsleiste rechts oben aufrufen.",
      "webinars": "Zu unseren regelmäßigen kostenlosen Webinaren können Sie sich unter folgendem Link anmelden:"
    }
  }
  </i18n>
