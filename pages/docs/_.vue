<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner
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
  <VeoPage
    v-if="document"
    :title="document.title"
  >
    <VeoCard class="mb-4">
      <v-card-text>
        <NuxtContent :document="document" />
      </v-card-text>
    </VeoCard>
  </VeoPage>
</template>
<script lang="ts">
import { defineComponent, useRoute, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { useDoc } from '~/composables/docs';

export default defineComponent({
  setup() {
    const { locale } = useI18n();
    const route = useRoute();
    const document = useDoc({
      path: `/${route.value.params.pathMatch || 'index'}`,
      locale: locale.value
    });

    watch(
      () => document.value?.path,
      (newValue) => {
        const pathSegments = (newValue || '').split('/');
        pathSegments.forEach(() => {
          pathSegments.pop();
          console.log(pathSegments);
        });
      }
    );

    return {
      document
    };
  }
});
</script>