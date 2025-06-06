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
    <v-img class="fill-width" src="/images/objectNotFound.svg" max-height="300px" contain />
    <h1 class="text-h1 mt-8">
      {{ t('notFoundCode').toString() }}
    </h1>
    <p class="mt-2 text-body-1">
      {{ text ?? t('pageDoesNotExist') }}
    </p>
    <v-btn v-if="hasDashboardButton" variant="text" color="primary" :to="dashboardRoute">
      {{ t('goToDashboard') }}
    </v-btn>
    <v-btn v-else variant="text" color="primary" @click="goBackToPreviousPage">
      {{ t('backToPrevious').toString() }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string;
  hasDashboardButton?: boolean;
}>();

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const dashboardRoute = `/${route.params.unit}/domains/${route.params.domain}/`;

const goBackToPreviousPage = () => {
  router.back();
};
</script>
<i18n src="~/locales/base/components/util-not-found-error.json"></i18n>
