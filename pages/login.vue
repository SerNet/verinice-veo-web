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
    <VeoAppLogoDesktop />
    <VeoCard class="mt-2">
      <v-card-text class="d-flex justify-space-around">
        <div style="flex-basis: 0; flex-grow: 1">
          <h4 class="text-h4 mb-4 cta">
            {{ t('loginCTA') }}
          </h4>
          <div class="text-center">
            <v-btn
              color="primary"
              depressed
              x-large
              @click="login"
            >
              {{ t('login') }}
            </v-btn>
          </div>
        </div>
        <v-divider
          class="mx-7"
          vertical
          light
        />
        <div style="flex-basis: 0; flex-grow: 1">
          <h4 class="text-h4 mb-4 cta">
            {{ t('createAccountCTA') }}
          </h4>
          <div class="text-center">
            <v-btn
              v-if="$config.accountPath"
              depressed
              x-large
              :href="$config.accountPath"
            >
              {{ t('register') }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </VeoCard>
    <div class="text-center mt-2">
      <a
        :href="dataProtectionRegulationLink"
        target="_blank"
      >{{ t('dataProtectionRegulations') }}</a>
      <span class="mx-1">|</span>
      <a
        :href="imprintLink"
        target="_blank"
      >{{ t('imprint') }}</a>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { useVeoUser } from '~/composables/VeoUser';

export default defineComponent({
  layout: 'plain',
  setup() {
    const { t, locale } = useI18n();
    const context = useContext();
    const { login: _login, initialize, keycloakInitialized } = useVeoUser();

    if (!keycloakInitialized.value) {
      initialize(context);
    }

    // Needed as a separate function, as _login would be undefined if directly called from within the template.
    const login = () => _login('/');

    const dataProtectionRegulationLink = computed(() => (locale.value === 'en' ? 'https://www.sernet.de/en/data-protection-declaration/' : 'https://www.sernet.de/datenschutz/'));
    const imprintLink = computed(() => (locale.value === 'en' ? 'https://account.verinice.com/en/left/Imprint/' : 'https://account.verinice.com/impressum/'));

    return {
      dataProtectionRegulationLink,
      imprintLink,
      login,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createAccountCTA": "Create a new account",
    "login": "Login",
    "register": "Register"
  },
  "de": {
    "createAccountCTA": "Einen neuen Account erstellen",
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

  .cta {
    height: 75px;
  }
}
</style>

<i18n>
{
  "en": {
    "dataProtectionRegulations": "Data protection regulations",
    "imprint": "Imprint",
    "loginCTA": "Login with an existing account"
  },
  "de": {
    "dataProtectionRegulations": "Datenschutzerklärung",
    "imprint": "Impressum",
    "loginCTA": "Mit einem vorhandenen Account anmelden"
  }
}
</i18n>
