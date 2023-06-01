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
  <div class="d-flex flex-column align-center">
    <v-img
      src="/images/noObjecttypeErrorImage.svg"
      max-height="300px"
      contain
    />
    <h1 class="text-h1 mt-8">
      {{ t('notFoundCode').toString() }}
    </h1>
    <p class="mt-2">
      {{ t('notFound').toString() }}
    </p>
    <slot />
  </div>
</template>

<script setup lang=ts">
const { t } = useI18n();
</script>

<i18n>
{
  "en": {
    "notFoundCode": "404 Not found",
    "notFound": "The object type could not be found."
  },
  "de": {
    "notFoundCode": "404 Not found",
    "notFound": "Der von Ihnen angeforderte Objekttyp konnte nicht gefunden werden."
  }
}
</i18n>
