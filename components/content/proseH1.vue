<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <a :id="id" class="relative -top-40px block h-0 overflow-hidden" />
  <h1 text-3xl class="group">
    <slot />
    <a header-anchor no-underline :href="`#${id}`">
      #
    </a>
  </h1>
</template>
