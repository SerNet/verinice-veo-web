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
  <template v-for="(enabled, key) in data" :key="key">
    <UserSettingsCard :item="{ key, enabled }" :handle-click="toggleSetting" :isloading="isLoading" />
  </template>
  <div class="d-flex justify-end">
    <v-btn color="primary" @click="Save">
      {{ t('save') }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { data, isLoading, Save, toggleSetting } = useSettings();
</script>

<i18n src="~/locales/base/components/user-settings-messages.json"></i18n>
