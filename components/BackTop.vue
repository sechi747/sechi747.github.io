<script lang="ts" setup>
const { visible, scrollToTop } = useBackTop(1000)
</script>

<template>
  <transition>
    <div
      v-show="visible"
      ref="backRef"
      base
      fixed right-40px bottom-40px
      w-40px h-40px rounded shadow-md fcc
      icon-btn z-10 text-20px
      bg="gray-50 dark:blue-gray-50/10"
      @click="scrollToTop"
    >
      <i i-carbon:up-to-top />
    </div>
  </transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 350ms ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
