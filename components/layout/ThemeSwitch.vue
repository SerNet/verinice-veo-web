<!--
   - verinice.veo web
   - Copyright (C) 2023 Frank Schneider
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
  <v-tooltip location="bottom" :aria-label="t('mode')">
    <template #activator="{ props }">
      <v-btn
        data-component-name="theme-switch"
        exact
        v-bind="props"
        :aria-label="t('mode')"
        :title="t('mode')"
        :icon="mdiThemeLightDark"
        @click="_switch"
      />
    </template>

    <template #default>
      {{ t('mode') }}
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';
import { mdiThemeLightDark } from '@mdi/js';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

const { t } = useI18n();
const theme = useTheme();
// determine the dark mode state from the previous session ('true' | 'false')
const darkModeState = localStorage.getItem(LOCAL_STORAGE_KEYS.DARK_MODE);
// if dark mode has been set before but the current theme is set to 'light', switch to dark mode
if (darkModeState === 'true' && theme.global.name.value === 'light') {
  theme.change('dark');
}
// alternate between modes ('dark' | 'light') and update the storage key accordingly
const _switch = () => {
  theme.change(theme.global.current.value.dark ? 'light' : 'dark');
  localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, (theme.global.name.value === 'dark').toString());
};
</script>

<i18n src="~/locales/base/components/layout-theme-switch.json"></i18n>
