<template>
  <div class="pa-3 overflow-auto">
    <NuxtContent :document="document"></NuxtContent>
  </div>
</template>
<script lang="ts">
import { defineComponent, useAsync, useContext, useRoute } from '@nuxtjs/composition-api';
import { FetchReturn } from '@nuxt/content/types/query-builder';
import { useI18n } from 'nuxt-i18n-composable';
export default defineComponent({
  layout: 'docs',
  setup() {
    const { error, $content } = useContext();
    const route = useRoute();
    const { locale } = useI18n();
    const document = useAsync(async () => {
      const pathMatch = '/' + (route.value.params.pathMatch || 'index');
      console.log('GET', pathMatch, locale.value);
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
    });
    return { document };
  },
  head(): any {
    return {
      title: this.document?.title
    };
  }
});
</script>