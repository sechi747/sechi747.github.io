<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <h1 text-2xl md-text-3xl base mb4>
    「 {{ props.title }} 」
  </h1>
  <p ml-4 text-base base italic>
    {{ props.description }}
  </p>
</template>
