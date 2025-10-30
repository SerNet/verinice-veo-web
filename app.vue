<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useLocale } from 'vuetify';
const { current } = useLocale();
const lang = computed(() => current.value);
useHead({
  meta: [
    {
      charset: 'utf-8'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0'
    },
    {
      'http-equiv': 'X-UA-Compatible',
      content: 'IE=edge'
    }
  ],

  htmlAttrs: {
    lang
  },

  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
});
</script>
