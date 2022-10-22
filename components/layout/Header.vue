<script setup lang="ts">
const logoUrl = computed(() => isDark.value ? '/logo-light.svg' : '/logo.svg')
const trainUrl = computed(() => isDark.value ? '/train-light.svg' : '/train.svg')
</script>

<template>
  <div
    w-full h-70px
    px-20
    flex justify-between items-center
    bg="gray-300/20"
  >
    <div icon-btn>
      <img
        h-6
        left-8
        top-6
        :src="logoUrl"
        alt="logo"
      >
    </div>
    <div flex="~ 1" justify-center icon-btn>
      <img
        h-6
        w-150
        top-6
        :src="trainUrl"
        alt="logo"
      >
    </div>
    <div grid gap-5 auto-flow-col items-center>
      <icon class="i-carbon-book icon-btn" />
      <icon class="i-carbon:ibm-cloud icon-btn" />
      <icon class="i-carbon-logo-github icon-btn" />
      <DarkToggle />
    </div>
  </div>
</template>
