<!--
   - verinice.veo web
   - Copyright (C) 2022 Jonas Heitmann
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
  <v-tooltip location="bottom">
    <template #activator="{ props: tooltip }">
      <div v-bind="tooltip">
        <v-menu offset-y bottom left nudge-bottom="2">
          <template #activator="{ props: menu }">
            <v-btn v-bind="menu" data-component-name="language-select" :icon="mdiTranslate" />
          </template>

          <template #default>
            <v-list
              v-model:selected="selectedLocale"
              color="primary"
              mandatory
              :items="locales"
              item-title="name"
              item-value="code"
            />
          </template>
        </v-menu>
      </div>
    </template>
    <span>{{ t('showHelp') }}</span>
  </v-tooltip>
</template>

<script setup lang="ts">
import { mdiTranslate } from '@mdi/js';

const { t, locale, locales, setLocale } = useI18n();
const selectedLocale = ref([locale.value]);

watch(selectedLocale, () => setLocale(selectedLocale.value[0]));
</script>

<i18n src="~/locales/base/components/layout-language-switch.json"></i18n>
