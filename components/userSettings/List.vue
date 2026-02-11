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
  <template v-if="data">
    <template v-for="(value, key) in data" :key="key">
      <UserSettingsCard
        v-if="typeof value === 'boolean'"
        :item="{ key, enabled: value }"
        :handle-click="toggleSetting"
        :isloading="isLoading"
      />
    </template>

    <UserSettingsCollapseSettingCard
      v-if="data['object-page-default-collapse'] !== undefined"
      :model-value="data['object-page-default-collapse']"
      :handle-change="handleCollapseChange"
      :is-loading="isLoading"
    />
  </template>
  <div class="d-flex justify-end">
    <v-btn color="primary" @click="save">
      {{ t('save') }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import type { ObjectPageCollapseOption } from '~/composables/api/useSettings';

const { t } = useI18n();
const { data, isLoading, save, toggleSetting, setSetting } = useSettings();

function handleCollapseChange(value: ObjectPageCollapseOption) {
  setSetting('object-page-default-collapse', value);
}
</script>

<i18n src="~/locales/base/components/user-settings-messages.json"></i18n>
