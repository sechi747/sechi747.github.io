<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <h1 :id="id" text-3xl class="group">
    {{ id }}
    <a header-anchor no-underline :href="`#${id}`">
      #
    </a>
  </h1>
</template>
