<script setup lang="ts">
const buttonTitle = computed(() => isDark.value ? 'switch to light mode' : 'switch to dark mode')

const toggleDark = () => {
  isDark.value = !isDark.value
}
</script>

<template>
  <i
    :title="buttonTitle"
    class="icon-btn dark:i-carbon-moon i-carbon-sun"
    :class="isDark ? 'hover:text-white' : 'hover:text-amber'"
    @click="toggleDark"
  />
</template>
