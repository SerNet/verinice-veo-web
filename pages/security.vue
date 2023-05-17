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
  <BasePage :title="t('headline')">
    <template #header>
      <v-icon :icon="mdiClock" />
      {{ t('expiration') }}: 2024-01-01T00:00:00.000Z
    </template>

    <BaseCard class="my-4">
      <v-card
        class="mb-2"
        elevation="4"
      >
        <v-card-title>Searching for Vulnerabilities</v-card-title>

        <v-card-text>
          We explicitly allow ethical hackers to test our application, but only under these terms:
          <br><br>
          - Do not use off-the-shelf scanners, try to avoid useless traffic.<br>
          - Set a sensible rate limiting (e.g. 600/min)<br>
          - Do not access customer data, use your own accounts where possible.<br>
          - No phishing, no DDoS, no post-exploitation...
        </v-card-text>
      </v-card>

      <v-card
        class="mb-2"
        elevation="4"
      >
        <v-card-title>Scope</v-card-title>

        <v-card-text>
          To be clear, you're only allowed to test
          <strong>veo-web.verinice.com</strong>,
          <strong>api.verinice.com</strong>,
          <strong>auth.verinice.com</strong>,
          <strong>account.verinice.com</strong>
          and nothing else.
          <br><br>
    
          And of course you can use the open source code in our and other repositories:<br><br>
          <a
            v-for="(link, key, index) in links"
            :key="index"
            :href="link"
            target="_blank"
          >SerNet/verinice-veo-{{ key }}<br>
          </a>
        </v-card-text>
      </v-card>

      <v-card
        class="mb-2"
        elevation="4"
      >
        <v-card-title>Reporting a Vulnerability</v-card-title>

        <v-card-text>
          Please e-mail to security@verinice.com if you believe you have found a security issue in verinice.veo.
          <br><br>
          In your bug report, please try to cover the following info:
          <br><br>
          - Proof of Concept: exact steps to reproduce the bug<br>
          - How did you discover the vulnerability?<br>
          - Your estimation of impact<br>
          - Suggestions for a fix
          <br><br>

          When receiving a bug report, we will look at it internally before answering,
          so expect some delay until you get an answer.
          Once we confirmed and talked about the vulnerability, we will contact you.
        </v-card-text>
      </v-card>

      <v-card
        class="mb-2"
        elevation="4"
      >
        <v-card-title>Responsible Disclosure</v-card-title>

        <v-card-text>
          The bug stays yours, but please give us enough time to fix it before disclosing it.
          We may need up to 120 days to fix the vulnerability you reported.
          Once we've published a fix for the vulnerability and told you we're done from our end,
          you can disclose the bug.
        </v-card-text>
      </v-card>

      <v-list>
        <v-list-item>
          <template #prepend>
            <v-icon :icon="mdiEmail" />
          </template>
          <a
            :href="mail"
          >{{ t('contact') }}
          </a>
          &nbsp;
          ({{ t('preferred') }}: DE, EN)
        </v-list-item>
      </v-list>
    </BaseCard>
  </BasePage>
</template>

<script lang="ts" setup>
import { mdiEmail, mdiClock } from '@mdi/js';

const { t } = useI18n();

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

<i18n>
  {
    "en": {
      "contact": "Contact",
      "expiration": "Expiration date",
      "headline": "Security Policy",
      "preferred": "Preferred languages",
    },
    "de": {
      "contact": "Kontakt",
      "expiration": "Gültigkeit",
      "headline": "Sicherheitsrichtlinie",
      "preferred": "Bevorzugte Sprachen",
    }
  }
</i18n>
