<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
    <LayoutHeadline :title="t('moreModules')" />

    <div class="my-8" style="width: 300px">
      <LayoutAppLogoDesktop />
    </div>
    <div class="text-body-1">
      <p>{{ t('moreModulesInfo') }}</p>
      <p>
        {{ t('furtherInformation') }}
        <a
          :href="
            locale === 'de' ?
              'https://verinice.com/veo'
            : 'https://verinice.com/en/veo'
          "
          target="_blank"
          >{{ t('linkName') }}</a
        >.
      </p>
    </div>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-more';
</script>

<script setup lang="ts">
const { t, locale } = useI18n();
</script>

<i18n>
{
  "en": {
    "furtherInformation": "An overview of further functions and domains can be found on the",
    "linkName": "verinice website",
    "moreModules": "Further domains",
    "moreModulesInfo": "The verinice.TEAM will successively provide further domains for verinice.veo."
  },
  "de": {
    "furtherInformation": "Eine Übersicht über weitere Funktionen und Domänen finden Sie auf der",
    "linkName": "verinice Webseite",
    "moreModules": "Weitere Domänen",
    "moreModulesInfo": "Das verinice.TEAM wird sukzessive weitere Domänen für verinice.veo zur Verfügung stellen."
  }
}
</i18n>
