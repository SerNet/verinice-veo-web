<!--
   - verinice.veo web
   - Copyright (C) 2025 Frank Schneider
   -
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation,
   - either version 3 of the License, or (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program. If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <span class="ma-4 small-caps">Redirecting ...</span>
</template>

<script setup lang="ts">
import { ROUTE_NAME as ROUTE_DASHBOARD } from '~/pages/[unit]/domains/[domain]/index.vue';
import { LOCAL_STORAGE_KEYS as STORAGE_KEYS } from '~/types/localStorage';

const route = useRoute();
const domain = window.localStorage.getItem(STORAGE_KEYS.LAST_DOMAIN);

await navigateTo({
  name: ROUTE_DASHBOARD,
  params: {
    unit: route.params.unit,
    domain
  }
});
</script>
