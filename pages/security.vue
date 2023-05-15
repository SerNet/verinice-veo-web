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
  <v-card
    title="Security Policy"
    variant="tonal"
  >
    <v-list>
      <v-list-item
        v-for="item in items"
        :key="item.title"
      >
        <template #prepend>
          <v-icon :icon="item.icon" />
        </template>

        <v-list-item-title v-text="`${item.title}: ${item.text}`" />
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts" setup>
import { mdiEmail, mdiClock, mdiAccount, mdiFlag } from '@mdi/js';
// const { locale } = useI18n();

// const imprintLink = computed(() =>
//   locale.value === 'de' ? 'https://www.sernet.de/impressum' : 'https://www.sernet.de/en/imprint'
// );

const items = [
  { title: 'Contact', text: 'security@verinice.com', icon: mdiEmail },
  { title: 'Expires', text: '2023-05-31T22:00:00.000Z', icon: mdiClock },
  { title: 'Preferred languages', text: 'de, en', icon: mdiFlag },
  { title: 'Policy', text: 'https://git.verinice.org/bb/projects/ISMS/repos/verinice-veo-web/browse/SECURITY.md', icon: mdiAccount }
];
</script>

<i18n>
  {
    "en": {
      "aboutText": "verinice is a software provided by SerNet GmbH",
      "imprint": "imprint",
    },
    "de": {
      "aboutText": "verinice ist eine Software der SerNet GmbH",
      "imprint": "Impressum",
    }
  }
</i18n>
