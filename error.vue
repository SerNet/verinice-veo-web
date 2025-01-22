<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann, Tino Groteloh
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
  <div class="d-flex fill-height overflow-y-auto">
    <div v-if="error" class="ma-auto pa-4 text-center">
      <v-img :src="image" max-height="300px" contain />

      <h1 class="text-h1 mt-8">
        {{ upperFirst(t(errorIsCustomized ? `titles.${error.statusCode}` : 'titles.default').toString()) }}
      </h1>
      <p class="mt-2">
        {{ upperFirst(t(errorIsCustomized ? `texts.${error.statusCode}` : 'texts.default').toString()) }}
      </p>

      <div>
        <!-- @vue-ignore TODO #3066 $router does not exist -->
        <v-btn
          v-if="error.statusCode === 403 || error.statusCode === 404"
          variant="text"
          color="primary"
          @click="$router.back()"
        >
          {{ $t('global.button.previous') }}
        </v-btn>
        <!-- @vue-ignore TODO #3066 $router does not exist -->
        <v-btn v-if="error.statusCode !== 401" variant="text" color="primary" @click="$router.push('/')">
          {{ t('goToHomepage') }}
        </v-btn>
      </div>
    </div>

    <div v-else class="ma-auto pa-4 text-center">
      <v-img :src="image" max-height="300px" contain />

      <h1 class="text-h1 mt-8">
        {{ upperFirst(t('titles.default').toString()) }}
      </h1>
      <p class="mt-2">
        {{ upperFirst(t('texts.default').toString()) }}
      </p>

      <!-- @vue-ignore TODO #3066 $router does not exist -->
      <v-btn variant="text" color="primary" @click="$router.push('/')">
        {{ t('goToHomepage') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NuxtError } from 'nuxt/app';
import { upperFirst } from 'lodash';

const props = defineProps<{
  error: NuxtError;
}>();

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

const CUSTOMIZED_ERROR_PAGES = [401, 403, 404];

const errorIsCustomized = computed(() => CUSTOMIZED_ERROR_PAGES.includes(props.error.statusCode || -1));

const image = computed(() => `/images/${props.error.statusCode === 404 ? 'pageNotFound' : 'defaultError'}.svg`);
</script>

<i18n src="~/locales/base/components/error.json"></i18n>
