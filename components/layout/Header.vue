<script setup lang="ts">
const logoUrl = computed(() => isDark.value ? '/logo-light.svg' : '/logo.svg')
</script>

<template>
  <div
    w-full h-18
    px-10
    fbc
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
    <div grid gap-5 auto-flow-col items-center>
      <i
        class="i-carbon-blog icon-btn"
        :class="isDark ? 'hover:text-white' : 'hover:text-emerald-500'"
      />
      <i
        class="i-carbon:pen-fountain icon-btn"
        :class="isDark ? 'hover:text-white' : 'hover:text-emerald-500'"
      />
      <i
        class="i-carbon-logo-github icon-btn"
        :class="isDark ? 'hover:text-white' : 'hover:text-black'"
      />
      <DarkToggle />
    </div>
  </div>
</template>
