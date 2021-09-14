<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <div class="fill-width fill-height d-flex flex-column overflow-hidden">
    <!-- Encapsulate header in div as to not interfere with the pages -->
    <div :class="titleClass">
      <h1
        v-if="title"
        class="d-inline px-4 py-1 flex-grow-0"
        v-text="title"
      />
      <slot
        v-else
        name="title"
      />
      <slot name="header" />
    </div>
    <v-row
      no-gutters
      class="veo-page-wrapper overflow-hidden"
    >
      <slot name="default" />
    </v-row>
    <slot name="helpers" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

interface IProps {
  title: String;
  titleClass: String;
}

export default defineComponent<IProps>({
  props: {
    title: {
      type: String,
      default: undefined
    },
    titleClass: {
      type: String,
      default: undefined
    }
  }
});
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-page-wrapper {
  flex-wrap: nowrap;
}
</style>
