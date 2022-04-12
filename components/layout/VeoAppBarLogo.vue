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
  <div class="py-2 text-center">
    <VeoAppLogoDesktop
      v-if="showDesktop"
      style="width: 90%"
    />
    <VeoAppLogoMobile v-else-if="showMobile" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api';

export default defineComponent({
  props: {
    size: {
      type: String,
      default: 'auto'
    }
  },
  setup(props) {
    // @ts-ignore
    const { $vuetify } = useContext();

    const showDesktop = computed(() => props.size !== 'small' && ($vuetify.breakpoint.mdAndUp || props.size === 'large'));
    const showMobile = computed(() => props.size !== 'large');
    return {
      showDesktop,
      showMobile
    };
  }
});
</script>
