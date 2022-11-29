<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Markus Werner, Tino Groteloh
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
  <div class="wrapper">
    <v-row class="flex-column text-center">
      <v-col class="d-flex">
        <VeoAppLogoDesktop />
      </v-col>
      <v-col class="mt-10">
        <v-btn
          depressed
          block
          color="primary"
          class="login-button"
          @click="login"
        >
          {{ t('login') }}
        </v-btn>
      </v-col>
      <v-col v-if="$config.accountPath">
        <v-btn
          depressed
          block
          color="white"
          :href="$config.accountPath"
        >
          {{ t('register') }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, useContext } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { useVeoUser } from '~/composables/VeoUser';

export default defineComponent({
  layout: 'plain',
  setup() {
    const { t } = useI18n();
    const context = useContext();
    const { login: _login, initialize, keycloakInitialized } = useVeoUser();

    if (!keycloakInitialized.value) {
      initialize(context);
    }

    // Needed as a separate function, as _login would be undefined if directly called from within the template.
    const login = () => _login('/');

    return {
      login,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "login": "Login",
    "register": "Register"
  },
  "de": {
    "login": "Anmelden",
    "register": "Registrieren"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.wrapper {
  margin: 5% auto 0;
  max-width: 420px;
  width: 90%;

  h1 {
    color: rgb(237, 237, 237);
    font-family: 'Trebuchet MS', Helvetica, Arial, sans-serif;
    font-size: 52px;
    font-weight: 400;
  }
}

.v-btn {
  border-radius: 0px;
}
</style>
