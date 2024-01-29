<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <span>Redirecting...</span>
</template>

<script setup lang="ts">
import { ROUTE_NAME as OBJECT_OVERVIEW_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/index.vue';

const route = useRoute();

// Navigate the user to the object overview page with a placeholder for the subtype
await navigateTo({
  name: OBJECT_OVERVIEW_ROUTE,
  params: {
    unit: route.params.unit,
    domain: route.params.domain,
    objectType: route.params.objectType,
    subType: '-',
  },
});
</script>
