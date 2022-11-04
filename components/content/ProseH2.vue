<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <a :id="id" class="relative -top-40px block h-0 overflow-hidden" />
  <h2 text-2xl class="group">
    {{ id }}
    <a header-anchor no-underline :href="`#${id}`">
      #
    </a>
  </h2>
</template>
