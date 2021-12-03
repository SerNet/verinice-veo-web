<template>
  <div
class="pa-3 overflow-auto"
style="max-width: 900px">
    <NuxtContent :document="document"></NuxtContent>
    <TableOfContents
children-property="childItems"
:value="toc" />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, unref, useAsync, useContext, useRoute } from '@nuxtjs/composition-api';
import { FetchReturn } from '@nuxt/content/types/query-builder';
import { useI18n } from 'nuxt-i18n-composable';
import { listToTree } from '~/lib/docs';
export default defineComponent({
  layout({ route }) {
    return 'print' in route.query ? 'plain' : 'docs';
  },
  setup() {
    const { error, $content } = useContext();
    const route = useRoute();
    const { locale } = useI18n();
    /* const document = useAsync(async () => {
      const pathMatch = '/' + (route.value.params.pathMatch || 'index');
      const [doc]: any = await $content('/', { deep: true })
        .where({
          $or: [{ path: pathMatch + '.' + locale.value }, { path: pathMatch + '.de' }, { path: pathMatch }]
        })
        .limit(1)
        .fetch();
      if (!doc) {
        return error({ statusCode: 404, message: 'Page not found' });
      }
      return doc as FetchReturn;
    }); */

    const ssr = useAsync(async () => {
      const pathMatch = '/' + (route.value.params.pathMatch || 'index');
      const [doc]: any = await $content('/', { deep: true })
        .where({
          $or: [{ path: pathMatch + '.' + locale.value }, { path: pathMatch + '.de' }, { path: pathMatch }]
        })
        .limit(1)
        .fetch();

      if ('print' in route.value.query === false || !doc?.dir) return { doc };
      const items = await $content(doc.dir, { deep: true })
        .where({ lang: { $undefinedin: [locale.value, undefined] } })
        .sortBy('dir', 'asc')
        .fetch<{ title: string; position: number; lang: string }>();
      if (!Array.isArray(items)) return { doc };
      const files = items
        .sort((a, b) => ((a.lang || b.lang || locale.value) === locale.value ? 0 : -1)) // Sort documents with matching locale to the end
        .map((item) => {
          const path = item.path.split('.').shift() || item.path; // Remove language extension from path
          return {
            ...item,
            name: item.title || item.slug,
            disabled: false,
            exact: true,
            icon: 'mdi-file',
            to: `/docs${path}`,
            topLevelItem: false,
            path // dont use path as it includes the locale
          };
        });

      const tree = listToTree(files, (file) => ({
        ...file,
        name: file.path.split('/').slice(0, -1).pop() || 'Neu'
      }));
      return { tree, doc };
    });

    const document = computed(() => ssr.value?.doc);
    const toc = computed(() => ssr.value?.tree);

    return { toc, document };
  },
  head(): any {
    return {
      title: this.document?.title
    };
  }
});
</script>