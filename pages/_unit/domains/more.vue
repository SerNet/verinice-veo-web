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
  <VeoPage :title="t('moreModules')">
    <div
      class="mb-6"
      style="height: 50px"
    >
      <VeoAppLogoDesktop />
    </div>
    <div class="text-body-1">
      <p>{{ t('moreModulesInfo') }}</p>
      <p>{{ t('moreModulesEta') }}</p>
      <p>
        {{ t('furtherInformation') }} <a
          :href="locale === 'de' ? 'https://verinice.com/veo' : `https://verinice.com/${locale}/veo`"
          target="_blank"
        >{{ t('linkName') }}</a>.
      </p>
    </div>
  </VeoPage>
</template>

<script lang="ts">
import { defineComponent, useMeta } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

export default defineComponent({
  setup() {
    const { t, locale } = useI18n();
    const { title } = useMeta();

    title.value = t('moreModules').toString();

    return {
      t,
      locale
    };
  },
  head: {}
});
</script>

<i18n>
{
  "en": {
    "furtherInformation": "An overview of further functions and modules can be found on the",
    "linkName": "verinice.veo webseite",
    "moreModules": "Further modules",
    "moreModulesEta": "The current planning is to present verinice.veo as an ISMS tool with the modules BSI IT-Grundschutz according to the standards of the 200 series and ISO 27001 to the public at it-sa 2022 and to make it generally available at the beginning of 2023.",
    "moreModulesInfo": "The verinice.TEAM will successively provide further modules for verinice.veo."
  },
  "de": {
    "furtherInformation": "Eine Übersicht über weitere Funktionen und Module finden Sie auf der",
    "linkName": "verinice.veo Webseite",
    "moreModules": "Weitere Module",
    "moreModulesEta": "Die aktuelle Planung sieht vor, verinice.veo als ISMS-Tool mit den Modulen BSI IT-Grundschutz nach den Standards der 200er-Reihe und ISO 27001 zur it-sa 2022 der Öffentlichkeit vorzustellen und Anfang 2023 allgemein verfügbar zu machen.",
    "moreModulesInfo": "Das verinice.TEAM wird sukzessive weitere Module für verinice.veo zur Verfügung stellen."
  }
}
</i18n>
