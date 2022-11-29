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
    <template #activator="{ on }">
      <v-btn
        v-bind="$attrs"
        color="black"
        icon
        data-component-name="language-select"
        v-on="on"
      >
        <v-icon>{{ mdiTranslate }}</v-icon>
      </v-btn>
    </template>
    <template #default>
      <v-list dense>
        <v-list-item-group
          :value="$i18n.locale"
          color="primary"
          mandatory
        >
          <v-list-item
            v-for="locale of $i18n.locales"
            :key="locale.code"
            :value="locale.code"
            @click="onLanguageSwitch(locale.code)"
          >
            <v-list-item-title>{{ locale.name }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </template>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent, useContext } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiTranslate } from '@mdi/js';

export default defineComponent({
  setup() {
    const { i18n } = useContext();
    const { t } = useI18n();

    const onLanguageSwitch = (locale: string) => {
      i18n.setLocale(locale);
    };

    return {
      onLanguageSwitch,

      mdiTranslate,
      t
    };
  }
});
</script>
