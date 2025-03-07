<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { addHolidayTheme } from '~/components/holidayThemes';
const { locale } = useI18n();
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
        lang: locale.value 
      },
    
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
});
addHolidayTheme();
</script>
