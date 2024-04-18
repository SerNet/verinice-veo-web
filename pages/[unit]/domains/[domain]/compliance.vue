<!--
   - verinice.veo web
   - Copyright (C) 2023 jae
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
  <BasePage style="height: 100vh">
    <template #header>
      <!-- Link back to Control-Object: to be changed when the IT-SA is done -->
      <p class="mt-8 mb-4 text-body-1" style="cursor: pointer" @click="$router.go(-1)">
        {{ t('hint', { currentName }) }}
      </p>
    </template>

    <template #default>
      <ComplianceList @update:current-name="currentName = $event" />
    </template>
  </BasePage>
</template>
<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-compliance';
</script>

<script setup lang="ts">
const { t } = useI18n();

const currentName = ref('');
</script>

<i18n>
{
"de": {
  "hint": "Umgesetzte Anforderungen \"{currentName}\" bearbeiten.",
},
"en": {
  "hint": "Edit requirement \"{currentName}\".",
}

}
</i18n>
