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
      <v-card style="border-radius: 0">
        <v-card-text class="d-flex flex-row align-center justify-space-between py-0">
          <span class="text-body-1">
            {{ t('cookieBannerText') }}
            <a :href="dataProtectionDeclarationLink" target="_blank">{{ t('moreInformation') }}</a>
          </span>
          <div>
            <v-btn flat color="primary" class="mx-1 my-3" @click="acceptRequiredCookies">
              {{ t('declineOptionalCookies') }}
            </v-btn>
            <v-btn flat color="primary" class="mx-1 my-3" @click="cookieConfigurationVisible = true">
              {{ t('configure') }}
            </v-btn>
            <v-btn
              flat
              color="primary"
              class="mx-1 my-3"
              data-veo-test="cookies-btn-accept-all"
              @click="acceptAllCookies"
            >
              {{ t('acceptAllCookies') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
    <v-navigation-drawer v-model="cookieConfigurationVisible" temporary class="pa-4" :width="300">
      <template #default>
        <h2 class="text-h2 mb-2">
          {{ t('cookieSettings') }}
        </h2>
        <span class="text-body-1">
          {{ t('cookieBannerText') }}
          <a :href="dataProtectionDeclarationLink" target="_blank">{{ t('moreInformation') }}</a>
        </span>
        <v-expansion-panels :model-value="[0]" multiple variant="accordion">
          <v-expansion-panel v-for="(category, index) of categories" :key="index">
            <v-expansion-panel-title v-if="category.options.length">
              <v-checkbox :value="true" class="pt-0 mt-0" disabled dense hide-details :label="category.label" />
            </v-expansion-panel-title>
            <v-expansion-panel-text class="pl-4">
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
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-btn flat class="mt-6" color="primary" block @click="acceptAllCookies">
          {{ t('acceptAllCookies') }}
        </v-btn>
        <v-btn flat class="mt-2" color="primary" block @click="acceptSelection">
          {{ t('save') }}
        </v-btn>
      </template>
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import { StorageSerializers, useStorage } from '@vueuse/core';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

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
      locale.value === 'en' ?
        'https://www.sernet.de/en/data-protection-declaration/'
      : 'https://www.sernet.de/de/datenschutz/'
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
    const cookieSelection = useStorage<ACCEPTED_COOKIES>(LOCAL_STORAGE_KEYS.ACCEPTED_COOKIES, null, localStorage, {
      serializer: StorageSerializers.object
    });
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
        optional:
          OPTIONAL_COOKIES.every((cookie) => localCookieSelection.value.includes(cookie)) && !!OPTIONAL_COOKIES.length,
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

<i18n src="~/locales/base/components/layout-cookie-banner.json"></i18n>

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
body:has(.v-navigation-drawer--active) .veo-cookie-banner {
  flex: 1 0 auto;
  max-width: 100%;
  transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding-left: var(--v-layout-left);
  padding-right: var(--v-layout-right);
  padding-top: var(--v-layout-top);
  padding-bottom: var(--v-layout-bottom);
}


body:not(:has(.v-navigation-drawer--active)) .veo-cookie-banner {
  margin-left: 0;
}
</style>
