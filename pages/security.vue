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
  <v-layout>
    <!-- German version -->
    <BasePage v-if="locale === 'de'">
      <LayoutHeadline :title="'Sicherheitsrichtlinie'" />

      <div class="d-flex justify-center">
        <BaseCard class="my-12" style="max-width: 500px; min-width: 500px">
          <v-card-title class="bg-accent">
            <div class="mx-4 d-flex" style="height: 75px; width: 300px">
              <LayoutAppLogoDesktop />
            </div>

            <v-card-subtitle class="my-4 bg-accent">
              <v-row>
                <v-col class="text-h4">
                  <v-icon :icon="mdiClock" />
                  <span class="ml-4">Erzeugt am: {{ creationDate }}</span>
                </v-col>
              </v-row>
            </v-card-subtitle>
          </v-card-title>

          <v-col class="d-flex">
            <BaseCard class="mt-4" :border="false">
              <v-card-title class="small-caps">
                Suche nach Schwachstellen
              </v-card-title>

              <v-card-text class="mt-6 text-justify">
                <p
                  >Wir erlauben ethischen Hackern ausdrücklich unsere Anwendung
                  zu testen, aber nur unter den folgenden Bedingungen:</p
                >
                <br />

                <ul class="mx-4">
                  <li
                    >Verwenden Sie keine Scanner von der Stange und versuchen
                    Sie, überflüssigen Datenverkehr zu vermeiden</li
                  >
                  <li>Setzen Sie ein vernünftiges Rate-Limit</li>
                  <li
                    >Greifen Sie nicht auf Kundendaten zu und verwenden Sie nach
                    Möglichkeit Ihre eigenen Konten</li
                  >
                  <li>Kein Phishing, kein DDoS, keine Post-Exploitation ...</li>
                </ul>
              </v-card-text>
            </BaseCard>
          </v-col>

          <v-col class="d-flex">
            <BaseCard :border="false">
              <v-card-title class="small-caps"> Geltungsbereich </v-card-title>

              <v-card-text class="mt-6 text-justify">
                <p>
                  Zur Verdeutlichung: Sie dürfen nur
                  <strong>veo-web.verinice.com</strong>,
                  <strong>api.verinice.com</strong>,
                  <strong>auth.verinice.com</strong>,
                  <strong>account.verinice.com</strong>
                  testen und nichts anderes.
                </p>
                <br />

                <p
                  >Und natürlich können Sie den Open-Source-Code in unseren und
                  anderen Repositories verwenden:</p
                >
                <br />

                <ul class="mx-4">
                  <li v-for="(link, key, index) in links" :key="index">
                    <a
                      class="text-decoration-none text-primary"
                      :href="link"
                      rel="noopener noreferrer"
                      target="_blank"
                      >SerNet/verinice-veo-{{ key }}
                    </a>
                  </li>
                </ul>
              </v-card-text>
            </BaseCard>
          </v-col>

          <v-col class="d-flex">
            <BaseCard :border="false">
              <v-card-title class="small-caps">
                Meldung einer Schwachstelle
              </v-card-title>

              <v-card-text class="mt-6 text-justify">
                <p>
                  Bitte senden Sie eine E-Mail an
                  <strong>security@verinice.com</strong>, wenn Sie glauben, dass
                  Sie ein Sicherheitsproblem in verinice.veo gefunden haben.
                </p>
                <br />

                <p
                  >Versuchen Sie bitte in Ihrem Fehlerbericht die folgenden
                  Informationen anzugeben:</p
                >
                <br />

                <ul class="mx-4">
                  <li
                    >Proof of Concept: genaue Schritte zur Reproduktion des
                    Fehlers</li
                  >
                  <li>Wie haben Sie die Sicherheitslücke entdeckt?</li>
                  <li>Ihre Abschätzung der Auswirkungen</li>
                  <li>Vorschläge für eine Behebung</li>
                </ul>
                <br />

                <p class="text-justify">
                  Wenn wir einen Fehlerbericht erhalten, werden wir ihn intern
                  prüfen, bevor wir ihn beantworten; rechnen Sie also mit einer
                  gewissen Verzögerung, bis Sie eine Antwort erhalten. Sobald
                  wir die Schwachstelle bestätigt und diskutiert haben, werden
                  wir Sie kontaktieren.
                </p>
              </v-card-text>
            </BaseCard>
          </v-col>

          <v-col class="d-flex">
            <BaseCard :border="false">
              <v-card-title class="small-caps">
                Verantwortungsvolle Offenlegung
              </v-card-title>

              <v-card-text class="mt-6 text-justify">
                <p>
                  Der Fehler gehört Ihnen, aber bitte geben Sie uns genügend
                  Zeit ihn zu beheben, bevor Sie ihn veröffentlichen. Wir können
                  bis zu 120 Tage brauchen, um die von Ihnen gemeldete
                  Schwachstelle zu schließen.
                </p>
                <p class="mt-4">
                  Sobald wir eine Lösung für die Sicherheitslücke veröffentlicht
                  und Ihnen mitgeteilt haben, dass wir damit fertig sind, können
                  Sie den Fehler veröffentlichen.
                </p>
              </v-card-text>

              <v-divider />
              <v-list class="d-flex align-end">
                <v-list-item>
                  <template #prepend>
                    <v-icon :icon="mdiEmail" />
                    <a class="text-decoration-none text-red" :href="mail"
                      >Kontakt</a
                    >&nbsp; ( Bevorzugte Sprachen: DE, EN )
                  </template>
                </v-list-item>
              </v-list>
            </BaseCard>
          </v-col>
        </BaseCard>
      </div>
    </BasePage>

    <!-- English version -->
    <BasePage v-else>
      <LayoutHeadline :title="'Security Policy'" />

      <div class="d-flex justify-center">
        <BaseCard class="my-12" style="max-width: 500px; min-width: 500px">
          <v-card-title class="bg-accent">
            <div class="mx-4 d-flex" style="height: 75px; width: 300px">
              <LayoutAppLogoDesktop />
            </div>

            <v-card-subtitle class="my-4 bg-accent">
              <v-row>
                <v-col class="text-h4">
                  <v-icon :icon="mdiClock" />
                  <span class="ml-4">Created on: {{ creationDate }}</span>
                </v-col>
              </v-row>
            </v-card-subtitle>
          </v-card-title>

          <v-col class="d-flex">
            <BaseCard class="mt-4" :border="false">
              <v-card-title class="small-caps">
                Searching for Vulnerabilities
              </v-card-title>

              <v-card-text class="mt-6 text-justify">
                <p
                  >We explicitly allow ethical hackers to test our application,
                  but only under the following terms:</p
                >
                <br />

                <ul class="mx-4">
                  <li
                    >Do not use off-the-shelf scanners, try to avoid useless
                    traffic</li
                  >
                  <li>Set a sensible rate limit (e.g. 600/min)</li>
                  <li
                    >Do not access customer data; use your own accounts where
                    possible</li
                  >
                  <li>No phishing, no DDoS, no post-exploitation ...</li>
                </ul>
              </v-card-text>
            </BaseCard>
          </v-col>

          <v-col class="d-flex">
            <BaseCard :border="false">
              <v-card-title class="small-caps"> Scope </v-card-title>

              <v-card-text class="mt-6 text-justify">
                <p>
                  To be clear, you're only allowed to test
                  <strong>veo-web.verinice.com</strong>,
                  <strong>api.verinice.com</strong>,
                  <strong>auth.verinice.com</strong>,
                  <strong>account.verinice.com</strong>
                  and nothing else.
                </p>
                <br />

                <p
                  >And of course you can use the open source code in our and
                  other repositories:</p
                >
                <br />

                <ul class="mx-4">
                  <li v-for="(link, key, index) in links" :key="index">
                    <a
                      class="text-decoration-none text-primary"
                      :href="link"
                      rel="noopener noreferrer"
                      target="_blank"
                      >SerNet/verinice-veo-{{ key }}
                    </a>
                  </li>
                </ul>
              </v-card-text>
            </BaseCard>
          </v-col>

          <v-col class="d-flex">
            <BaseCard :border="false">
              <v-card-title class="small-caps">
                Reporting a Vulnerability
              </v-card-title>

              <v-card-text class="mt-6 text-justify">
                <p
                  >Please e-mail to <strong>security@verinice.com</strong> if
                  you believe you have found a security issue in
                  verinice.veo.</p
                >
                <br />

                <p
                  >In your bug report, please try to cover the following
                  info:</p
                >
                <br />

                <ul class="mx-4">
                  <li>Proof of Concept: exact steps to reproduce the bug</li>
                  <li>How did you discover the vulnerability?</li>
                  <li>Your estimation of impact</li>
                  <li>Suggestions for a fix</li>
                </ul>
                <br />

                <p class="text-justify">
                  When receiving a bug report, we will look at it internally
                  before answering, so expect some delay until you get an
                  answer. Once we confirmed and talked about the vulnerability,
                  we will contact you.
                </p>
              </v-card-text>
            </BaseCard>
          </v-col>

          <v-col class="d-flex">
            <BaseCard :border="false">
              <v-card-title class="small-caps">
                Responsible Disclosure
              </v-card-title>

              <v-card-text class="mt-6 text-justify">
                <p>
                  The bug stays yours, but please give us enough time to fix it
                  before disclosing it. We may need up to 120 days to fix the
                  vulnerability you reported.
                </p>
                <p class="mt-4">
                  Once we've published a fix for the vulnerability and told you
                  we're done from our end, you can disclose the bug.
                </p>
              </v-card-text>

              <v-divider />
              <v-list class="d-flex align-end">
                <v-list-item>
                  <template #prepend>
                    <v-icon :icon="mdiEmail" />
                    <a class="text-decoration-none text-red" :href="mail"
                      >Contact</a
                    >&nbsp; ( Preferred languages: DE, EN )
                  </template>
                </v-list-item>
              </v-list>
            </BaseCard>
          </v-col>
        </BaseCard>
      </div>
    </BasePage>
  </v-layout>
</template>

<script setup lang="ts">
import { mdiEmail, mdiClock } from '@mdi/js';

const { locale } = useI18n();

const date = new Date();

const creationDate = computed(() =>
  date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
);

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
