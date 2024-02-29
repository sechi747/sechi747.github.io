<script setup lang="ts">
const color = useGlobalColorMode()

const logoUrl = ref('/logo.svg')

watch(
  () => color.value,
  () => nextTick(() => logoUrl.value = color.value === 'dark' ? '/logo-light.svg' : '/logo.svg'),
  { immediate: true },
)
</script>

<template>
  <div
    w-full h-14
    px-10
    fbc
    border="b-1 gray-200/50 important-dark:gray-200/20"
    fixed left-0 right-0 top-0 z-10
    backdrop-blur-xl backdrop-saturate-150
  >
    <NuxtLink to="/">
      <img
        icon-btn
        h-6
        left-8
        top-6
        :src="logoUrl"
        alt="logo"
      >
    </NuxtLink>
    <div grid gap-5 auto-flow-col>
      <NuxtLink to="/posts">
        <i
          title="posts"
          class="i-carbon-blog icon-btn hover:text-emerald-500 dark:hover:text-white"
        />
      </NuxtLink>

      <!-- <NuxtLink to="/moments">
        <i
          title="moments"
          class="i-carbon:pen-fountain icon-btn hover:text-emerald-500 dark:hover:text-white"
        />
      </NuxtLink> -->

      <NuxtLink to="https://github.com/sechi747" target="_blank">
        <i
          title="github"
          class="i-carbon-logo-github icon-btn hover:text-black dark:hover:text-white"
        />
      </NuxtLink>
      <DarkToggle />
    </div>
  </div>
</template>
