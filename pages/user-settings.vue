<!--
   - verinice.veo web
   - Copyright (C) 2025 Haneen Husin
   - 
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BasePage v-if="hasUserSettings" sticky-footer>
    <h1 class="text-h3">{{ t('userSettingsPage.header') }}</h1>
    <text>{{ t('userSettingsPage.body') }}</text>
    <v-row class="align-start">
      <v-col class="mt-4" cols="12">
        <UserSettingsToggleState />
      </v-col>
    </v-row>
  </BasePage>
</template>
<script setup lang="ts">
import { useFeatureFlag } from '~/composables/features/featureFlag';

const { t } = useI18n();
const { hasFeature } = useFeatureFlag();
const hasUserSettings = hasFeature('userSettings');
</script>

<i18n src="~/locales/base/components/user-settings-messages.json"></i18n>
