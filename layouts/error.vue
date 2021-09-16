<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
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
  <VeoPage fullsize>
    <v-row class="fill-height flex-column text-center align-center">
      <v-spacer />
      <v-col>
        <v-icon
          style="font-size: 8rem; opacity: 0.5;"
          color="primary"
        >
          mdi-information-outline
        </v-icon>
      </v-col>
      <v-col
        cols="auto"
        class="text-left"
      >
        <h3>{{ $t('error.title') }}:</h3>
        <p>{{ error.message }}</p>
        <v-card-subtitle>Error code: {{ error.statusCode }}</v-card-subtitle>
      </v-col>
      <v-spacer />
    </v-row>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  layout: 'default',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  head(): any {
    return {
      title: 'verinice.',
      titleTemplate: '%s - verinice.'
    };
  }
});
</script>

<style lang="scss" scoped></style>
