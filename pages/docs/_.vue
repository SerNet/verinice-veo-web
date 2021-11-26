<template>
  <div class="pa-3">
    <NuxtContent :document="document"></NuxtContent>
  </div>
</template>
<script lang="ts">
import { defineComponent, useAsync, useContext, useRoute } from '@nuxtjs/composition-api';
import { FetchReturn } from '@nuxt/content/types/query-builder';
export default defineComponent({
  layout: 'docs',
  setup() {
    const { error, $content } = useContext();
    const route = useRoute();
    const document = useAsync(async () => {
      const [doc]: any = await $content('/')
        .where({ slug: route.value.params.pathMatch || 'index' })
        .limit(1)
        .fetch();
      if (!doc) {
        return error({ statusCode: 404, message: 'Page not found' });
      }
      return doc as FetchReturn;
    });
    return { document };
  }
});
</script>