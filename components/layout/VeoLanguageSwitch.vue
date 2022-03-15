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
  <v-select
    v-model="lang"
    class="veo-language-select"
    color="primary"
    dense
    filled
    hide-details
    :items="langs"
    :prepend-inner-icon="mdiEarth"
  >
    <template #selection="{ item }">
      {{ item.value.toUpperCase() }}
    </template>
  </v-select>
</template>

<script lang="ts">
import { defineComponent, useContext, computed } from '@nuxtjs/composition-api';
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

    const langs = app.i18n.locales.map((locale: any) => ({ text: locale.name, value: locale.code }));

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

<style lang="scss" scoped>
.veo-language-select {
  border-radius: 4px;
  flex-grow: 0;
  overflow: hidden;
  width: 100px;
}

::v-deep.veo-language-select .v-select__selections {
  align-items: baseline;
}

::v-deep.veo-language-select .v-input__icon--prepend-inner .v-icon {
  color: $primary;
}
</style>
