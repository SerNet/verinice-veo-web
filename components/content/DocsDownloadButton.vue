<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <v-tooltip
    location="bottom"
  >
    <template #activator="{ props }">
      <div v-bind="props">
        <v-btn
          href="/docs?print"
          variant="flat"
          color="primary"
          class="mr-2"
          target="_blank"
        >
          {{ t('buttonCopy') }}
        </v-btn>
      </div>
    </template>
    <template #default>
      {{ t('tooltipCopy') }}
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>

<i18n>
{
  "en": {
    "buttonCopy": "Print preview / Download",
    "tooltipCopy": "Print this documentation or create a PDF"
  },
  "de": {
    "buttonCopy": "Druckvorschau / Download",
    "tooltipCopy": "Drucken Sie diese Dokumentation oder erstellen Sie ein PDF"
  }
}
</i18n>
