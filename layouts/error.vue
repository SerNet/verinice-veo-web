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
        :src="`/images/${is404 ? 'pageNotFound' : 'defaultError'}.svg`"
        max-height="300px"
        contain
      />
      <h1 class="text-h1 mt-8">
        {{ is404 ? '404' : '' }} {{ upperFirst(t(is404 ? 'notFound' : 'unknownError').toString()) }}
      </h1>
      <p class="mt-2">
        {{ t(is404 ? 'pageNotFound' : 'unknownErrorOccured') }}
      </p>
      <div>
        <v-btn
          v-if="is404"
          text
          color="primary"
          @click="$router.back()"
        >
          {{ t('global.button.previous') }}
        </v-btn>
        <v-btn
          text
          color="primary"
          @click="$router.push('/')"
        >
          {{ t('goToHomepage') }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useI18n } from 'nuxt-i18n-composable';
import { NuxtError } from '@nuxt/types';
import { upperFirst } from 'lodash';
import { computed, defineComponent, useMeta } from '@nuxtjs/composition-api';

export default defineComponent({
  layout: 'plain',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  setup(props: { error: NuxtError }) {
    const { t } = useI18n();

    const is404 = computed(() => props.error.statusCode === 404);

    useMeta(() => ({
      title: 'verinice.',
      titleTemplate: '%s - verinice.veo'
    }));

    return {
      t,
      is404,
      upperFirst
    };
  },
  head: {}
});
</script>

<i18n>
{
  "en": {
    "goToHomepage": "go to homepage",
    "notFound": "not found",
    "pageNotFound": "The page you are looking for could not be found.",
    "unknownError": "unknown error",
    "unknownErrorOccured": "An unknown error occured."
  },
  "de": {
    "goToHomepage": "Zur Startseite",
    "notFound": "not found",
    "pageNotFound": "Die gesuchte Seite konnte leider nicht gefunden werden.",
    "unknownError": "unbekannter Fehler",
    "unknownErrorOccured": "Ein unbekannter Fehler ist aufgetreten."
  }
}
</i18n>
