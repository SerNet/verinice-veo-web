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
  <div class="document">
    <div class="page">
      <h1 class="mx-auto">veo. Documentation</h1>
    </div>
    <TableOfContents
class="page"
children-property="childItems"
:value="files" />
    <div
v-for="document in documents"
:id="document.path"
:key="document.path"
class="page">
      <NuxtContent :document="document" />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useDocs } from '~/composables/docs';
export default defineComponent({
  layout: 'print',
  validate({ route, redirect }) {
    if ('print' in route.query) {
      return true;
    } else {
      redirect('/docs/index');
      return false;
    }
  },
  setup() {
    const files = useDocs({
      createDirs: true,
      buildItem(item) {
        return {
          ...item,
          name: item.isDir ? `${upperFirst(item.slug)} (${item.path})` : `${item.title || item.slug} (${item.path})`,
          to: item.path
        };
      }
    });

    const documents = computed(() => files.value || []);

    return { files, documents };
  },
  head(): any {
    return {
      title: 'Dokumentation',
      script: [{ src: '/paged.polyfill.js' }]
    };
  }
});
</script>
<style lang="scss">
html {
  overflow: initial !important;
}
</style>
<style lang="scss" scoped>
@media screen {
  .page {
    margin-bottom: 4em;
  }
  .document {
    width: 100%;
    max-width: 900px;
    margin: 1em;
  }
}
@media print {
  @page {
    size: A4;
    margin: 25mm 25mm 25mm 25mm;
    counter-increment: page;
  }

  @page:right {
    @bottom-right {
      content: counter(page) '/' counter(pages);
      font-family: Arial, Sans Serif;
    }
  }

  .page {
    page-break-after: always;
  }
}
</style>