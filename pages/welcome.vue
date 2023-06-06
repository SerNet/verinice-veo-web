<template>
  <BasePage
    title="Erste Schritte"
  >
    <div class="d-flex justify-center">
      <BaseCard style="width: 70%; max-width: 1000px;">
        <v-card-title>Willkommen bei verinice.veo!</v-card-title>

        <br>
        <v-card-text>
          Im diesem Abschnitt finden Sie Anregungen des verinice.Teams, die Ihnen einen schnellen Einstieg ermöglichen:<br><br>

          — Die <strong>Demodaten</strong> beinhalten eine komplette Beispielorganisation.
          Sie können die Inhalte nach Belieben ändern um alle Features und Funktionen kennen zu lernen
          oder direkt als Basis für die Abbildung Ihrer Organisation verwenden.<br><br>

          <LayoutDemoUnitButton /><br><br>

          — Die <strong>Online-Dokumentation</strong> beschreibt ausführlich alle Funktionen von verinice.veo und erläutert die technischen Aspekte.
          Sie können die <strong>Online-Dokumentation</strong> jederzeit über das Symbol
          <v-icon :icon="mdiHelpCircleOutline" /> in der Anwendungsleiste rechts oben öffnen.<br><br>

          — Zur schnellen Orientierung stehen auf jeder Seite kontextbezogene <strong>Tutorials</strong> zur Verfügung.
          Verfügbare <strong>Tutorials</strong> können Sie jederzeit über das Symbol
          <v-icon :icon="mdiInformationOutline" /> in der Anwendungsleiste rechts oben aufrufen.<br><br>

          — In unserem <strong>YouTube channel</strong> finden Sie Videos zu verinice.veo.
          <a
            :href="veoVideoLink"
            target="_blank"
          >
            <strong>verinice@Youtube</strong>
          </a><br><br>

          — Zu unseren regelmäßigen kostenlosen <strong>Webinaren</strong> können Sie sich unter folgendem Link anmelden:
          <a
            href="https://verinice.com/webinare"
            target="_blank"
          >
            <strong>Webinare</strong>
          </a><br><br>

          — Im <strong>verinice.Forum</strong> finden Sie weitergehende Informationen und können am regen Austausch
          mit anderen Anwenderinnen und Anwendern teilnehmen:<br>
          <a
            href="https://forum.verinice.com"
            target="_blank"
          >
            <strong>verinice.Forum</strong>
          </a><br><br>

          — Sie können diese Seite jederzeit über den Account Button <strong>Erste Schritte</strong> erneut aufrufen!<br>
        </v-card-text>
      </BaseCard>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { mdiInformationOutline, mdiHelpCircleOutline } from '@mdi/js';

const veoVideoLink = ref('https://www.youtube.com/playlist?list=PLYG8Ez-PzQxtY660HESHsyD9sultD1ldf');
</script>
