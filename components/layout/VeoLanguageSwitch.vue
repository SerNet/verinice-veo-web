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
  <v-menu offset-y>
    <template #activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        outlined
        color="primary"
        v-on="on"
      >
        <v-icon
          left
          dark
        >
          {{ mdiEarth }}
        </v-icon>
        {{ locale.toUpperCase() }}
        <v-icon
          right
          dark
        >
          {{ mdiChevronDown }}
        </v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item-group
        v-model="lang"
        color="primary"
      >
        <v-list-item
          v-for="(item) in langs"
          :key="item.text"
          :value="item.value"
        >
          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent, useContext, ref, computed } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiChevronDown, mdiEarth } from '@mdi/js';

export default defineComponent({
  setup() {
    const { app } = useContext();
    const { t, locale } = useI18n();

    const lang = computed({
      get() {
        return locale.value;
      },
      set(newValue: string) {
        app.i18n.setLocale(newValue);
        // After the language change, reload the page to avoid synchronisation problems
        // Reload here should not be a big problem, because a user will not often change the language
        window.location.reload();
      }
    });
    const langs = ref([
      { value: 'en', text: 'EN' },
      { value: 'de', text: 'DE' }
    ]);

    return {
      lang,
      langs,

      mdiChevronDown,
      mdiEarth,
      locale,
      t
    };
  }
});
</script>
