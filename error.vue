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
    <div class="ma-auto pa-4 text-center">
      <v-img
        :src="image"
        max-height="300px"
        contain
      />
      <h1 class="text-h1 mt-8">
        {{ upperFirst(t(errorIsCustomized ? `titles.${error.statusCode}` : 'titles.default').toString()) }}
      </h1>
      <p class="mt-2">
        {{ upperFirst(t(errorIsCustomized ? `texts.${error.statusCode}` : 'texts.default').toString()) }}
      </p>
      <div>
        <!-- fake-code 451: purpose: need a different error message; backend returns 403 in case of a deactivated account -->
        <v-btn
          v-if="error.statusCode === 451"
          variant="text"
          color="primary"
          @click="$router.push('/login')"
        >
          {{ t('gotoLogin') }}
        </v-btn>

        <v-btn
          v-if="error.statusCode === 403 || error.statusCode === 404"
          variant="text"
          color="primary"
          @click="$router.back()"
        >
          {{ $t('global.button.previous') }}
        </v-btn>
        <v-btn
          v-if="![401, 451].includes(error.statusCode)"
          variant="text"
          color="primary"
          @click="$router.push('/')"
        >
          {{ t('goToHomepage') }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NuxtError } from '#app';
import { upperFirst } from 'lodash';
import { PropType } from 'vue';

definePageMeta({ layout: 'plain' });

const props = defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    default: null
  }
});


const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });

const CUSTOMIZED_ERROR_PAGES = [401, 403, 404, 451];

const errorIsCustomized = computed(() => CUSTOMIZED_ERROR_PAGES.includes(props.error.statusCode || -1));

const image = computed(() => `/images/${props.error.statusCode === 404 ? 'pageNotFound' : 'defaultError'}.svg`);
</script>

<i18n>
{
  "en": {
    "goToHomepage": "go to homepage",
    "gotoLogin": "go to login",
    "texts": {
      "401": "Please come back later",
      "403": "You don't have the required permissions to enter this page.",
      "404": "The page you are looking for could not be found.",
      "451": "Please contact your account manager.",
      "default": "An unknown error occured."
    },
    "titles": {
      "401": "login unavailable",
      "403": "access forbidden",
      "404": "404 not found",
      "451": "Account disabled",
      "default": "unknown error"
    }
  },
  "de": {
    "goToHomepage": "Zur Startseite",
    "gotoLogin": "Zurück zum Login",
    "texts": {
      "401": "Bitte versuchen Sie es zu einem späteren Zeitpunkt erneut",
      "403": "Sie besitzen nicht die notwendigen Berechtigungen, um diese Seite aufzurufen.",
      "404": "Die gesuchte Seite konnte leider nicht gefunden werden.",
      "451": "Bitte kontaktieren Sie Ihren Account-Manager.",
      "default": "An unknown error occured."
    },
    "titles": {
      "401": "login nicht verfügbar",
      "403": "zugriff verweigert",
      "404": "nicht gefunden",
      "451": "Account deaktiviert",
      "default": "unbekannter Fehler"
    }
  }
}
</i18n>
