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
    <div
      opacity-75 transition duration-200 ease-in-out hover:opacity-100
      class="dark:i-carbon-moon i-carbon-sun"
      :class="isDark ? 'hover:text-white' : 'hover:text-amber'"
    />
  </button>
</template>
