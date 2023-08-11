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
  <v-btn
    data-component-name="theme-switch"
    :icon="mdiThemeLightDark"
    title="Toggle Theme"
    @click="_switch"
  />
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';
import { mdiThemeLightDark } from '@mdi/js';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

const DARK = 'dark';
const LIGHT = 'light';

const theme = useTheme();

const darkModeSet = localStorage.getItem(LOCAL_STORAGE_KEYS.DARK_MODE);

if (darkModeSet === 'true' && theme.global.name.value === LIGHT) {
  theme.global.name.value = DARK;
}

const _switch = () => {
  theme.global.name.value = theme.global.current.value.dark ? LIGHT : DARK;
  localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, (theme.global.name.value === DARK).toString());
};
</script>
