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
    <nuxt-link :to="logoLink" target="_blank">
      <div v-if="onprem">
        <LayoutAppLogoOnPrem />
      </div>
      <div v-else>
        <LayoutVeriniceCloudLogo width="100%" />
      </div>
    </nuxt-link>

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
      <v-card-text class="d-flex justify-center align-center gap-4">
        <div v-if="loginInstruction" class="text-center">
          <h4 class="text-h4 cta">
            {{ loginInstruction }}
          </h4>
          <v-btn
            v-if="loginInstruction"
            color="primary"
            class="mt-2"
            data-veo-test="login-btn-login"
            size="x-large"
            @click="login"
          >
            {{ t('login') }}
          </v-btn>
        </div>
        <v-divider v-if="registrationInstruction && loginInstruction" vertical light class="mx-6" />
        <div v-if="registrationInstruction" class="text-center">
          <h4 class="text-h4 cta">
            {{ registrationInstruction }}
          </h4>
          <v-btn
            v-if="registrationAction && registrationLink"
            variant="tonal"
            size="x-large"
            class="mt-2"
            :href="registrationLink"
          >
            {{ registrationAction }}
          </v-btn>
        </div>
      </v-card-text>
    </BaseCard>
    <div v-if="localizedLinks" class="d-flex justify-center mt-3">
      <div v-for="(link, index) in localizedLinks" :key="link.url" class="d-flex">
        <nuxt-link :href="link.url" target="_blank">
          {{ link.label }}
        </nuxt-link>
        <span v-if="index < localizedLinks.length - 1" class="mx-1">|</span>
      </div>
    </div>
    <div class="d-flex justify-end w-25 mt-4">
      <v-img :src="customLogo" alt="Logo" />
    </div>
  </div>
</template>

<script setup lang="ts">
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
const { data: customerConfig } = await useFetch<any>('/customer/config.json');
function useLocalizedField(key: string) {
  return computed(() => customerConfig.value?.[key]?.[locale.value]);
}
const onprem = customerConfig.value?.['onprem'];
const logoLink = useLocalizedField('logoLink');
const loginInstruction = useLocalizedField('loginInstruction');
const registrationInstruction = useLocalizedField('registrationInstruction');
const registrationAction = useLocalizedField('registrationAction');
const registrationLink = useLocalizedField('registrationLink');
const customLogo = customerConfig.value?.['customLogo'];

const localizedLinks = computed<{ label: string; url: string }[]>(() =>
  (customerConfig.value?.links ?? []).map((link) => ({
    label: link.label[locale.value],
    url: link.link[locale.value]
  }))
);
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
    text-align: center;
    white-space: pre-line;
  }
}
</style>
