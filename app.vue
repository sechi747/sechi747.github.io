<script setup>
import '~/assets/styles/main.css'
import '~/assets/styles/dark-mono.css'
import '~/assets/styles/markdown.css'

useHead({
  title: 'PlantSechi',
  link: [
    {
      rel: 'icon', type: 'image/x-icon', href: '/favicon.ico',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
