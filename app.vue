<template>
  <NuxtLayout>
    <Transition name="page" mode="out-in">
      <NuxtPage />
    </Transition>
  </NuxtLayout>
</template>

<script setup>
useHead({
  title: 'verinice.veo',
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
})
</script>
