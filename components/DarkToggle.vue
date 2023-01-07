<script setup lang="ts">
const color = useGlobalColorMode()

const buttonTitle = ref('')

const toggleColor = () => color.value = color.value === 'dark' ? 'light' : 'dark'

watch(
  () => color.value,
  () => nextTick(() => buttonTitle.value = color.value === 'dark' ? 'switch to light mode' : 'switch to dark mode'),
  { immediate: true },
)
</script>

<template>
  <i
    :title="buttonTitle"
    class="icon-btn i-carbon-sun hover:text-amber"
    dark="i-carbon-moon hover:text-white "
    @click="toggleColor"
  />
</template>
