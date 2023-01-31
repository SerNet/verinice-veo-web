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
  <v-menu
    offset-y
    bottom
    left
    nudge-bottom="2"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="mergeProps($attrs, props)"
        color="black"
        icon
        data-component-name="language-select"
      >
        <v-icon :icon="mdiTranslate" />
      </v-btn>
    </template>
    <template #default>
      <v-list
        v-model:selected="selectedLocale"
        active-color="primary"
        mandatory
        :items="availableLocales"
        item-title="name"
        item-value="code"
      />
    </template>
  </v-menu>
</template>

<script lang="ts" setup>
import { mergeProps } from 'vue';
import { mdiTranslate } from '@mdi/js';
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables';

const { locale, locales, setLocale } = useI18n();

const selectedLocale = computed({
  get: () => [locale.value],
  set: (newValue) => { setLocale(newValue[0]); }
});

const availableLocales = computed<LocaleObject[]>(() => locales.value as LocaleObject[]);
</script>
