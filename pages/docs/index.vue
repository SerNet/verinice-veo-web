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
          name: item.isDir ? `${upperFirst(item.slug)} (${item.path})` : `${item.title || item.slug} (${item.path})`
        };
      }
    });

    const documents = computed(() => files.value || []);

    return { files, documents };
  },
  head(): any {
    return {
      title: 'Dokumentation'
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

  @page:left {
    @bottom-left {
      content: counter(page) ' of ' counter(pages);
      font-family: Arial, Sans Serif;
    }
  }

  @page:right {
    @bottom-right {
      content: counter(page) ' of ' counter(pages);
      font-family: Arial, Sans Serif;
    }
  }

  .page {
    page-break-after: always;
  }
}
</style>