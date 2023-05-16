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
  <BasePage>
    <v-card
      class="mt-4"
      :title="t('headline')"
      variant="tonal"
    >
      <v-list>
        <v-list-item>
          <template #prepend>
            <v-icon :icon="mdiEmail" />
          </template>
  
          <v-list-item-title>
            <a
              href="mailto:security@verinice.com?subject=Bug report"
            >{{ t('contact') }}
            </a>
          </v-list-item-title>
        </v-list-item>
  
        <v-list-item
          v-for="item in items"
          :key="item.title"
        >
          <template #prepend>
            <v-icon :icon="item.icon" />
          </template>
  
          <v-list-item-title v-text="`${t(item.title)}: ${t(item.text)}`" />
        </v-list-item>
        <v-list-item>
          <template #prepend>
            <v-icon :icon="mdiAccount" />
          </template>
  
          <v-list-item-title>
            <a
              href="https://git.verinice.org/bb/projects/ISMS/repos/verinice-veo-web/browse/SECURITY.md"
              target="_blank"
            >{{ t('policy') }}
            </a>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </BasePage>
</template>

<script lang="ts" setup>
import { mdiEmail, mdiClock, mdiAccount, mdiFlag } from '@mdi/js';

const { t } = useI18n();

const items = [
  { title: 'expiration', text: '2023-05-31T22:00:00.000Z', icon: mdiClock },
  { title: 'languageFav', text: 'languages', icon: mdiFlag }
];
</script>

<i18n>
  {
    "en": {
      "contact": "Contact",
      "expiration": "Expiration date",
      "headline": "Security Policy",
      "languageFav": "Preferred languages",
      "languages": "German, English",
      "policy": "Read the policy",
    },
    "de": {
      "contact": "Kontakt",
      "expiration": "Ablaufdatum",
      "headline": "Sicherheitsrichtlinie",
      "languageFav": "Bevorzugte Sprachen",
      "languages": "deutsch, englisch",
      "policy": "Lesen Sie die Richtlinien",
    }
  }
</i18n>
