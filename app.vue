<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import {addHolidayTheme} from "~/components/holidayThemes";

useHead({
  meta: [
    {
      charset: 'utf-8'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0, user-scalable=no'
    },
    {
      'http-equiv': 'X-UA-Compatible',
      content: 'IE=edge'
    }
  ],
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
});
addHolidayTheme()
</script>
