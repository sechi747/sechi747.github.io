<script setup lang="ts">
import { useDarkToggle } from '@/composables/useDarkToggle'

const { color, toggleDark } = useDarkToggle()

const buttonTitle = ref('')

nextTick(() => buttonTitle.value = color.value === 'dark' ? 'switch to light mode' : 'switch to dark mode')

watch(() => color.value, () => buttonTitle.value = color.value === 'dark' ? 'switch to light mode' : 'switch to dark mode')
</script>

<template>
  <i
    :title="buttonTitle"
    class="icon-btn i-carbon-sun hover:text-amber"
    dark="i-carbon-moon hover:text-white "
    @click="toggleDark"
  />
</template>
