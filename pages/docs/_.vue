<template>
  <div
v-if="document"
class="pa-3 overflow-auto"
style="width:100%; max-width: 900px">
    <div
class="caption">{{document.path}}</div>
    <NuxtContent :document="document"></NuxtContent>
  </div>
</template>
<script lang="ts">
import { defineComponent, useRoute } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { useDoc } from '~/composables/docs';
export default defineComponent({
  layout: 'docs',
  setup() {
    const { locale } = useI18n();
    const route = useRoute();
    const document = useDoc({
      path: `/${route.value.params.pathMatch || 'index'}`,
      locale: locale.value
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