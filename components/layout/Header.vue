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
    <NuxtLink to="/">
      <div icon-btn>
        <img
          h-6
          left-8
          top-6
          :src="logoUrl"
          alt="logo"
        >
      </div>
    </NuxtLink>
    <div grid gap-5 auto-flow-col>
      <NuxtLink to="/posts">
        <i
          class="i-carbon-blog icon-btn"
          :class="isDark ? 'hover:text-white' : 'hover:text-emerald-500'"
        />
      </NuxtLink>
      <i
        class="i-carbon:pen-fountain icon-btn"
        :class="isDark ? 'hover:text-white' : 'hover:text-emerald-500'"
      />
      <NuxtLink to="https://github.com/sechi747" target="_blank">
        <i
          class="i-carbon-logo-github icon-btn"
          :class="isDark ? 'hover:text-white' : 'hover:text-black'"
        />
      </NuxtLink>
      <DarkToggle />
    </div>
  </div>
</template>
