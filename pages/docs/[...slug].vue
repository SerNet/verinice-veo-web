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
    :title="_document && _document.title"
    :loading="!_document"
  >
    <BaseCard
      class="mb-4"
      style="max-width: 1024px"
    >
      <v-card-text class="text-body-1">
        <ContentRendererMarkdown
          v-if="_document"
          :value="_document"
        />
      </v-card-text>
    </BaseCard>
  </BasePage>
</template>
<script setup lang=ts">
import { isArray } from 'lodash';

import { useDoc, useDocs } from '~/composables/docs';
import { useVeoBreadcrumbs } from '~/composables/VeoBreadcrumbs';


const route = useRoute();
useHead(() => ({
  style: {
    src: './assets/styles/docs.scss'
  }
}));

const normalizedPath = computed(() => !isArray(route.params.slug) ? [route.params.slug] : route.params.slug);
const _document = useDoc({ path: `/${normalizedPath.value.join('/') || 'index'}` });
const { clearCustomBreadcrumbs, addCustomBreadcrumb } = useVeoBreadcrumbs();

// Navigation stuff (breadcrumbs)
const docs = useDocs({});
const updateBreadcrumbs = () => {
  // Remove previous custom breadcrumbs
  clearCustomBreadcrumbs();

  if (!docs.value?.length || !_document.value) {
    return;
  }

  // Get all path segments and the nesting level to know how many breadcrumb entries have to be created
  const pathSegments = (_document.value?._path || '').split('/').filter((segment) => segment);
  const nestingLevel = pathSegments.length;

  // Greater than 0 as we don't want to include the index page in the breadcrumbs
  for (let i = nestingLevel; i > 0; i--) {
    const currentPathSegments = pathSegments.slice(0, i);
    const unlocalizedCurrentPath = currentPathSegments.join('/').replace(/(\.\w+)/, '');

    const breadcrumbItem = (docs.value || []).find((doc) => doc._path === `/${unlocalizedCurrentPath}`);
    if (breadcrumbItem) {
      addCustomBreadcrumb({
        to: `/docs${breadcrumbItem._path}`,
        exact: true,
        key: breadcrumbItem._path,
        index: 0,
        text: breadcrumbItem.title,
        position: i * 10,
        param: ''
      });
    }
  }
};

const routeToHeader = () => {
  if(!_document.value || !route.hash){
    return;
  }
  scrollTo(0,(document?.querySelector(route.hash)?.getBoundingClientRect())?.y || 0);
};

watch(() => _document.value?._path, updateBreadcrumbs, { immediate: true });

watch(() => docs.value, updateBreadcrumbs, { deep: true, immediate: true });

watch(() => _document.value, routeToHeader, {deep:true, immediate: true});
</script>

<style lang="scss" scoped>
@import url('~/assets/styles/docs.scss');
</style>
