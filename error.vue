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
        <v-btn
          v-if="error.statusCode === 403 || error.statusCode === 404"
          variant="text"
          color="primary"
          @click="$router.back()"
        >
          {{ $t('global.button.previous') }}
        </v-btn>

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

<i18n>
{
  "en": {
    "goToHomepage": "go to homepage",
    "texts": {
      "401": "Please come back later",
      "403": "You don't have the required permissions to enter this page.",
      "404": "The page you are looking for could not be found.",
      "default": "An unknown error occurred."
    },
    "titles": {
      "401": "login unavailable",
      "403": "access forbidden",
      "404": "404 not found",
      "default": "unknown error"
    }
  },
  "de": {
    "goToHomepage": "Zur Startseite",
    "texts": {
      "401": "Bitte versuchen Sie es zu einem späteren Zeitpunkt erneut",
      "403": "Sie besitzen nicht die notwendigen Berechtigungen, um diese Seite aufzurufen.",
      "404": "Die gesuchte Seite konnte leider nicht gefunden werden.",
      "default": "An unknown error occurred."
    },
    "titles": {
      "401": "login nicht verfügbar",
      "403": "zugriff verweigert",
      "404": "nicht gefunden",
      "default": "unbekannter Fehler"
    }
  }
}
</i18n>
