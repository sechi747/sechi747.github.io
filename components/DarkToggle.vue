<script setup lang="ts">
const color = useColorMode()

const buttonTitle = ref('')

nextTick(() => {
  buttonTitle.value = color.value === 'dark' ? 'switch to light mode' : 'switch to dark mode'
})

watch(() => color.value, () => buttonTitle.value = color.value === 'dark' ? 'switch to light mode' : 'switch to dark mode')

function toggleDark() {
  color.preference = color.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <i
    :title="buttonTitle"
    class="icon-btn i-carbon-sun hover:text-amber"
    dark="i-carbon-moon hover:text-white "
    @click="toggleDark"
  />
</template>
