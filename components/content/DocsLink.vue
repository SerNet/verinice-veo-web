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
    :href="`#${transformedLink}`"
  >
    <slot name="default" />
  </a>
  <nuxt-link
    v-else
    :to="`/docs${transformedLink}`"
  >
    <slot name="default" />
  </nuxt-link>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    to: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute();

    const isPrintView = 'print' in route.query;

    const linkContainsId = computed(() => props.to.includes('#'));
    const linkId = computed(() => props.to.split('#')[1]);

    const addLeadingSlashIfNotExists = (link: string) => (link.startsWith('/') ? link : '/' + link);
    const removeTrailingSlashIfExists = (link: string) => (link.endsWith('/') ? link.substr(0, link.length - 1) : link);

    const transformedLink = computed(() => removeTrailingSlashIfExists(linkContainsId.value && isPrintView ? linkId.value : addLeadingSlashIfNotExists(props.to)));

    return {
      isPrintView,
      transformedLink
    };
  }
});
</script>
