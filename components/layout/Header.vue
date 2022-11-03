<script setup lang="ts">
// color.value初始值为system，value更新后dom没有更新，原因未知
const color = useColorMode()

const logoUrl = ref('/logo.svg')

nextTick(() => {
  logoUrl.value = color.value === 'dark' ? '/logo-light.svg' : '/logo.svg'
})

watchEffect(() => logoUrl.value = color.value === 'dark' ? '/logo-light.svg' : '/logo.svg')
</script>

<template>
  <div
    w-full h-18
    px-10
    fbc
    bg
    border="b-2 dashed gray-200/80 important-dark:gray-200/40"
    fixed z-10
  >
    <NuxtLink to="/">
      <img
        v-if="!color.unknown"
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

      <NuxtLink to="/moments">
        <i
          title="moments"
          class="i-carbon:pen-fountain icon-btn hover:text-emerald-500 dark:hover:text-white"
        />
      </NuxtLink>

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
