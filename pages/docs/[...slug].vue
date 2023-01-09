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
  <BasePage
    v-if="document"
    :title="document.title"
  >
    {{ fetchContentNavigation() }}
    <BaseCard
      class="mb-4"
      style="max-width: 1024px"
    >
      <v-card-text class="text-body-1">
        <ContentRenderer :document="document" />
      </v-card-text>
    </BaseCard>
  </BasePage>
</template>
<script lang="ts">
import { upperFirst } from 'lodash';

import { useDoc, useDocs } from '~/composables/docs';
import { useVeoBreadcrumbs } from '~/composables/VeoBreadcrumbs';

export default defineComponent({
  setup() {
    const route = useRoute();
    const document = useDoc({ path: `/${route.params.pathMatch || 'index'}` });
    const { clearCustomBreadcrumbs, addCustomBreadcrumb } = useVeoBreadcrumbs();

    const docs = useDocs({
      buildItem(item) {
        return {
          ...item,
          name: item.isDir ? `${upperFirst(item.slug)} (${item.path})` : `${item.title || item.slug} (${item.path})`,
          to: item.path
        };
      }
    });

    const updateBreadcrumbs = () => {
      // Remove previous custom breadcrumbs
      clearCustomBreadcrumbs();

      if (!docs.value?.length || !document.value) {
        return;
      }

      // Get all path segments and the nesting level to know how many breadcrumb entries have to be created
      const pathSegments = (document.value?.path || '').split('/').filter((segment) => segment);
      const nestingLevel = pathSegments.length;

      // Greater than 0 as we don't want to include the index page in the breadcrumbs
      for (let i = nestingLevel; i > 0; i--) {
        const currentPathSegments = pathSegments.slice(0, i);
        const unlocalizedCurrentPath = currentPathSegments.join('/').replace(/(\.\w+)/, '');

        const breadcrumbItem = (docs.value || []).find((doc) => doc.path === `/${unlocalizedCurrentPath}`);
        if (breadcrumbItem) {
          addCustomBreadcrumb({
            to: `/docs${breadcrumbItem.path}`,
            exact: true,
            key: breadcrumbItem.path,
            index: 0,
            text: breadcrumbItem.title,
            position: i * 10,
            param: ''
          });
        }
      }
    };

    watch(() => document.value?.path, updateBreadcrumbs, { immediate: true });

    watch(() => docs.value, updateBreadcrumbs, { deep: true, immediate: true });

    return {
      document
    };
  }
});
</script>
