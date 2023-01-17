<script lang='ts' setup>
const { page } = useContent()

const title = computed(() => page.value.title)

const createTime = computed(() => new Date(page.value.createTime).toDateString())
const createTimeAgo = useTimeAgo(new Date(page.value.createTime)).value.replace('"', '')

useContentHead(page)
</script>

<template>
  <div base>
    <h1 text-2xl md-text-3xl lg-text-4xl>
      {{ title }}
    </h1>
    <p important-text-op-70>
      {{ createTime }}
      <sub ml-2 bottom-0>Posted {{ createTimeAgo }}</sub>
    </p>
  </div>
</template>
