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
  <div v-if="!whitelabelMode" class="wrapper">
    <VeriniceCloudLogo />
    <BaseAlert
      :model-value="!!route.query.client_disabled"
      class="my-4"
      flat
      no-close-button
      :type="VeoAlertType.ERROR"
      :title="t('access')"
      :text="t('error-message')"
    />

    <BaseCard class="mt-2 bg-surface">
      <v-card-text class="d-flex justify-space-around">
        <div style="flex-basis: 0; flex-grow: 1">
          <h4 class="text-h4 cta">
            {{ t('loginCTA') }}
          </h4>
          <div class="text-center">
            <v-btn color="primary" data-veo-test="login-btn-login" flat size="x-large" @click="login">
              {{ t('login') }}
            </v-btn>
          </div>
        </div>
        <v-divider class="mx-7" vertical light />
        <div style="flex-basis: 0; flex-grow: 1">
          <h4 class="text-h4 cta">
            {{ t('subscribeCTA') }}
          </h4>
          <div class="text-center">
            <v-btn
              v-if="context.$config.public.accountPath"
              variant="tonal"
              size="x-large"
              :href="context.$config.public.accountPath"
            >
              {{ t('subscribe') }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </BaseCard>
    <div class="text-center mt-2">
      <a :href="dataProtectionRegulationLink" target="_blank">
        {{ t('dataProtectionRegulations') }}
      </a>
      <span class="mx-1">|</span>
      <a :href="imprintLink" target="_blank">
        {{ t('imprint') }}
      </a>
      <span class="mx-1">|</span>
      <nuxt-link to="/security" target="_blank">
        {{ t('policy') }}
      </nuxt-link>
    </div>
  </div>
  <div v-else class="fill-height d-flex align-center justify-center">
    <v-btn color="primary" data-veo-test="login-btn-login" flat size="x-large" @click="login">
      {{ t('login') }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import VeriniceCloudLogo from '~/components/layout/VeriniceCloudLogo.vue';
import { useVeoUser } from '~/composables/VeoUser';
import { VeoAlertType } from '~/types/VeoTypes';

definePageMeta({ layout: 'plain' });

const { t, locale } = useI18n();
const route = useRoute();
const context = useNuxtApp();
const { login: _login, initialize, keycloakInitialized } = useVeoUser();
useHead({
  title: t('login')
});

if (!keycloakInitialized.value) {
  initialize(context);
}

// Needed as a separate function, as _login would be undefined if directly called from within the template.
const login = () => _login((route.query.redirect_uri as string | undefined) || '/');

const dataProtectionRegulationLink = computed(() =>
  locale.value === 'en' ? 'https://www.sernet.de/en/data-protection-declaration/' : 'https://www.sernet.de/datenschutz/'
);
const imprintLink = computed(() =>
  locale.value === 'en' ? 'https://account.verinice.com/en/left/Imprint/' : 'https://account.verinice.com/impressum/'
);
const config = useRuntimeConfig();
const whitelabelMode = config.public.whitelabelMode === 'true';
</script>

<i18n src="~/locales/base/pages/login.json"></i18n>

<style lang="scss" scoped>
.wrapper {
  margin: 5% auto 0;
  max-width: 500px;
  width: 90%;

  h1 {
    color: rgb(237, 237, 237);
    font-family: 'Trebuchet MS', Helvetica, Arial, sans-serif;
    font-size: 52px;
    font-weight: 400;
  }

  .cta {
    height: 75px;
    text-align: center;
    white-space: pre-line;
  }
}
</style>
