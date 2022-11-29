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
  <div v-if="!cookieSelection">
    <div class="veo-border veo-cookie-banner">
      <v-card tile>
        <v-card-text class="d-flex flex-row align-center justify-space-between py-0">
          <span class="text-body-1">
            {{ t('cookieBannerText') }}
            <a
              :href="dataProtectionDeclarationLink"
              target="_blank"
            >{{ t('moreInformation') }}</a>
          </span>
          <div>
            <v-btn
              depressed
              color="primary"
              class="mx-1 my-3"
              @click="acceptRequiredCookies"
            >
              {{ t('declineOptionalCookies') }}
            </v-btn>
            <v-btn
              depressed
              color="primary"
              class="mx-1 my-3"
              @click="cookieConfigurationVisible = true"
            >
              {{ t('configure') }}
            </v-btn>
            <v-btn
              depressed
              color="primary"
              class="mx-1 my-3"
              @click="acceptAllCookies"
            >
              {{ t('acceptAllCookies') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
    <v-navigation-drawer
      v-model="cookieConfigurationVisible"
      temporary
      fixed
      class="pa-4"
      :width="300"
    >
      <template #default>
        <h2 class="text-h2 mb-2">
          {{ t('cookieSettings') }}
        </h2>
        <span class="text-body-1">
          {{ t('cookieBannerText') }}
          <a
            :href="dataProtectionDeclarationLink"
            target="_blank"
          >{{ t('moreInformation') }}</a>
        </span>
        <v-expansion-panels
          :value="[0]"
          multiple
          flat
        >
          <v-expansion-panel
            v-for="(category, index) of categories"
            :key="index"
          >
            <v-expansion-panel-header v-if="category.options.length">
              <v-checkbox
                :input-value="true"
                class="pt-0 mt-0"
                disabled
                dense
                hide-details
                :label="category.label"
              />
            </v-expansion-panel-header>
            <v-expansion-panel-content class="pl-4">
              <v-checkbox
                v-for="cookie of category.options"
                :key="cookie"
                v-model="localCookieSelection"
                :value="cookie"
                disabled
                dense
                hide-details
                :label="t(`cookie.${cookie}`)"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-btn
          depressed
          class="mt-6"
          color="primary"
          block
          @click="acceptAllCookies"
        >
          {{ t('acceptAllCookies') }}
        </v-btn>
        <v-btn
          depressed
          class="mt-2"
          color="primary"
          block
          @click="acceptSelection"
        >
          {{ t('save') }}
        </v-btn>
      </template>
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { StorageSerializers, useStorage } from '@vueuse/core';

type COOKIE_OPTIONS = 'keycloak' | 'i18n' | 'navigation';

const REQUIRED_COOKIES: COOKIE_OPTIONS[] = ['keycloak', 'i18n', 'navigation'];
const OPTIONAL_COOKIES: COOKIE_OPTIONS[] = [];

interface ACCEPTED_COOKIES {
  required: boolean;
  optional: boolean;
  selected: COOKIE_OPTIONS[];
}

export default defineComponent({
  setup() {
    const { t, locale } = useI18n();

    const dataProtectionDeclarationLink = computed(() =>
      locale.value === 'en' ? 'https://www.sernet.de/en/data-protection-declaration/' : 'https://www.sernet.de/de/datenschutz/'
    );
    const cookieConfigurationVisible = ref(false);

    const categories: {
      label: string;
      options: COOKIE_OPTIONS[];
    }[] = [
      {
        label: t('requiredCookies').toString(),
        options: REQUIRED_COOKIES
      },
      {
        label: t('optionalCookies').toString(),
        options: OPTIONAL_COOKIES
      }
    ];

    // Cookie handling
    const localCookieSelection = ref<COOKIE_OPTIONS[]>([]);
    const cookieSelection = useStorage<ACCEPTED_COOKIES>('accepted-cookies', null, localStorage, { serializer: StorageSerializers.object });
    watch(
      () => cookieSelection.value,
      (newValue) => (localCookieSelection.value = [...(newValue?.selected || []), ...REQUIRED_COOKIES]),
      { immediate: true }
    );

    const acceptAllCookies = () => {
      cookieSelection.value = { required: true, optional: true, selected: [] };
    };

    const acceptRequiredCookies = () => {
      cookieSelection.value = { required: true, optional: false, selected: [] };
    };

    const acceptSelection = () => {
      cookieSelection.value = {
        required: true,
        optional: OPTIONAL_COOKIES.every((cookie) => localCookieSelection.value.includes(cookie)) && !!OPTIONAL_COOKIES.length,
        selected: localCookieSelection.value
      };
    };

    return {
      acceptAllCookies,
      acceptRequiredCookies,
      acceptSelection,
      categories,
      cookieConfigurationVisible,
      cookieSelection,
      dataProtectionDeclarationLink,
      localCookieSelection,

      t
    };
  }
});
</script>

<style lang="scss" scoped>
.veo-cookie-banner {
  border-bottom-width: 0 !important;
  border-left-width: 0 !important;
  border-right-width: 0 !important;
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  z-index: 6;
}
</style>

<i18n>
{
  "en": {
    "acceptAllCookies": "Accept all cookies",
    "configure": "Configure",
    "cookieBannerText": "This website uses cookies to ensure the best experience possible.",
    "cookie": {
      "i18n": "Language settings",
      "keycloak": "Keycloak SSO",
      "navigation": "Navigation"
    },
    "cookieSettings": "Cookie-Settings",
    "declineOptionalCookies": "Decline optional cookies",
    "moreInformation": "More information...",
    "optionalCookies": "Optional cookies",
    "requiredCookies": "Required cookies",
    "save": "save"
  },
  "de": {
    "acceptAllCookies": "Alle Cookies akzeptieren",
    "configure": "Konfigurieren",
    "cookieBannerText": "Diese Website verwendet Cookies, um eine bestmögliche Erfahrung bieten zu können.",
    "cookieSettings": "Cookie-Voreinstellungen",
    "cookie": {
      "i18n": "Anwendungssprache",
      "keycloak": "Keycloak SSO",
      "navigation": "Navigation"
    },
    "declineOptionalCookies": "Optionale Cookies ablehnen",
    "moreInformation": "Mehr Informationen...",
    "optionalCookies": "Optional",
    "requiredCookies": "Technisch erforderlich",
    "save": "speichern"
  }
}
</i18n>