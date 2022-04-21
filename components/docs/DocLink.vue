<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <a
    v-if="isPrintView"
    :href="`#${toWithLeadingSlash}`"
  ><slot name="default" /></a>
  <nuxt-link
    v-else
    :to="`/docs${toWithLeadingSlash}`"
  >
    <slot name="default" />
  </nuxt-link>
</template>

<script lang="ts">
import { computed, defineComponent, useRoute } from '@nuxtjs/composition-api';

export default defineComponent({
  props: {
    to: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute();

    const isPrintView = Object.prototype.hasOwnProperty.call(route.value.query, 'print');

    const toWithLeadingSlash = computed(() => (props.to.startsWith('/') ? props.to : '/' + props.to));

    return {
      isPrintView,
      toWithLeadingSlash
    };
  }
});
</script>
