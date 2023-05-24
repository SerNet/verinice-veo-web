<!--
   - verinice.veo web
   - Copyright (C) 2023  Frank Schneider
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
  <BasePage title="Sicherheitsrichtlinie">
    <template #header>
      <v-icon :icon="mdiClock" />
      Gültig bis: {{ d(config.public.securityPolicyInvalidationDate) }}
    </template>

    <BaseCard class="my-4">
      <v-card-title>Suche nach Schwachstellen</v-card-title>

      <v-card-text>
        Wir erlauben ethischen Hackern ausdrücklich unsere Anwendung zu testen, aber nur unter den folgenden Bedingungen:
        <br><br>
        - Verwenden Sie keine Scanner von der Stange und versuchen Sie, nutzlosen Datenverkehr zu vermeiden.<br>
        - Setzen Sie ein vernünftiges Rate-Limit (z.B. 600/min)<br>
        - Greifen Sie nicht auf Kundendaten zu und verwenden Sie nach Möglichkeit Ihre eigenen Konten.<br>
        - Kein Phishing, kein DDoS, keine Post-Exploitation...
      </v-card-text>
    </BaseCard>

    <BaseCard class="my-4">
      <v-card-title>Geltungsbereich</v-card-title>
      <v-card-text>
        Zur Verdeutlichung: Sie dürfen nur
        <strong>veo-web.verinice.com</strong>,
        <strong>api.verinice.com</strong>,
        <strong>auth.verinice.com</strong>,
        <strong>account.verinice.com</strong>
        testen und nichts anderes.
        <br><br>

        Und natürlich können Sie den Open-Source-Code in unseren und anderen Repositories verwenden:<br><br>
        <a
          v-for="(link, key, index) in links"
          :key="index"
          :href="link"
          target="_blank"
        >SerNet/verinice-veo-{{ key }}<br>
        </a>
      </v-card-text>
    </BaseCard>

    <BaseCard class="my-4">
      <v-card-title>Meldung einer Schwachstelle</v-card-title>
      <v-card-text>
        Bitte senden Sie eine E-Mail an <em>security@verinice.com</em>, wenn Sie glauben,
        dass Sie ein Sicherheitsproblem in verinice.veo gefunden haben.
        <br><br>
        Versuchen Sie bitte in Ihrem Fehlerbericht die folgenden Informationen anzugeben:
        <br><br>
        - Proof of Concept: genaue Schritte zur Reproduktion des Fehlers<br>
        - Wie haben Sie die Sicherheitslücke entdeckt?<br>
        - Ihre Schätzung der Auswirkungen<br>
        - Vorschläge für eine Behebung
        <br><br>

        Wenn wir einen Fehlerbericht erhalten, werden wir ihn intern prüfen, bevor wir ihn beantworten;
        rechnen Sie also mit einer gewissen Verzögerung, bis Sie eine Antwort erhalten.
        Sobald wir die Schwachstelle bestätigt und besprochen haben, werden wir Sie kontaktieren.
      </v-card-text>
    </BaseCard>

    <BaseCard class="my-4">
      <v-card-title>Verantwortungsvolle Offenlegung</v-card-title>
      <v-card-text>
        Der Fehler gehört Ihnen, aber bitte geben Sie uns genügend Zeit ihn zu beheben, bevor Sie ihn veröffentlichen.
        Wir können bis zu 120 Tage brauchen, um die von Ihnen gemeldete Schwachstelle zu schließen.
        Sobald wir eine Lösung für die Sicherheitslücke veröffentlicht und Ihnen mitgeteilt haben,
        dass wir damit fertig sind, können Sie den Fehler veröffentlichen.
      </v-card-text>
      <v-list>
        <v-list-item>
          <template #prepend>
            <v-icon :icon="mdiEmail" />
          </template>
          <a
            :href="mail"
          >Kontakt
          </a>
          &nbsp;
          ( Bevorzugte Sprachen: DE, EN )
        </v-list-item>
      </v-list>
    </BaseCard>
  </BasePage>
</template>

<script lang="ts" setup>
import { mdiEmail, mdiClock } from '@mdi/js';

const { d } = useI18n();
const config = useRuntimeConfig();

const mail = 'mailto:security@verinice.com?subject=Bug report';

const links = {
  web: 'https://github.com/SerNet/verinice-veo-web',
  veo: 'https://github.com/SerNet/verinice-veo',
  accounts: 'https://github.com/SerNet/verinice-veo-accounts',
  reporting: 'https://github.com/SerNet/verinice-veo-reporting',
  history: 'https://github.com/SerNet/verinice-veo-history',
  forms: 'https://github.com/SerNet/verinice-veo-forms'
};
</script>
