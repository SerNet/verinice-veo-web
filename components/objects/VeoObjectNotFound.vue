<!--
   - verinice.veo web
   - Copyright (C) 2021  Samuel Vitzthum
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
  <div class="d-flex flex-column align-center justify-center fill-height">
    <v-img
      src="/images/objectNotFound.svg"
      max-height="300px"
      contain
    />
    <h1 class="text-h1 mt-8">
      {{ t('notFoundCode').toString() }}
    </h1>
    <p class="mt-2">
      {{ t('notFound').toString() }}
    </p>
    <v-btn
      text
      color="primary"
      @click="goBackToPreviousPage"
    >
      {{ t('backToPrevious').toString() }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent, useRouter } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

export default defineComponent({
  name: 'VeoObjectNotFound',
  setup() {
    const { t } = useI18n();
    const router = useRouter();

    const goBackToPreviousPage = () => {
      router.back();
    };

    return { t, goBackToPreviousPage };
  }
});
</script>

<i18n>
{
  "en": {
    "notFoundCode": "404 Not found",
    "notFound": "The object that you requested could not be found.",
    "backToPrevious": "back to previous page"
  },
  "de": {
    "notFoundCode": "404 Not found",
    "notFound": "Das von Ihnen angeforderte Objekt konnte nicht gefunden werden.",
    "backToPrevious": "zurück zur vorherigen Seite"
  }
}
</i18n>
