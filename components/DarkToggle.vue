<script setup lang="ts">
const buttonTitle = computed(() => isDark.value ? 'switch to light mode' : 'switch to dark mode')

const toggleDark = () => {
  isDark.value = !isDark.value
}
</script>

<template>
  <button
    :title="buttonTitle"
    class="!outline-none"
    @click="toggleDark"
  >
    <div class="dark:i-carbon-moon i-carbon-sun" />
  </button>
</template>
