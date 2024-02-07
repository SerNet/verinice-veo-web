<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Davit Svandize, Jonas Heitmann
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
  <div>
    <LayoutAppLogoDesktop v-if="showDesktop" height="60%" width="85%" />
    <LayoutAppLogoMobile v-else-if="showMobile" height="80%" width="80%" style="max-height: 40px" />
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify';

const props = defineProps({
  size: {
    type: String,
    default: 'auto'
  }
});

const { mdAndUp } = useDisplay();

const showDesktop = computed(() => props.size !== 'small' && (mdAndUp.value || props.size === 'large'));
const showMobile = computed(() => props.size !== 'large');
</script>
