<script setup lang="ts">
import type { JsonFile, Moment } from '~~/types'

definePageMeta({
  validate: async () => {
    return false
  },
})

useHead({ title: 'PlantSechi | Moments' })

const { data } = await useAsyncData('moments', () => queryContent<JsonFile>('/moments').findOne())

const parseList = computed<Moment[]>(() => {
  const momentsList: Moment[] = []
  for (const [key, value] of Object.entries(data.value as JsonFile)) {
    if (/^\d{13}/.test(key))
      momentsList.push({ createTime: Number(key), content: value as string })
  }
  return momentsList.sort((a, b) => b.createTime - a.createTime)
})
</script>

<template>
  <div prose font-mono ma origin>
    <DefaultHeader title="Moments" description="try to catch something fleeting" />
    <div
      v-for="(item, index) of parseList"
      :key="item.createTime"
      :class="index !== parseList.length - 1 ? 'mb-6' : ''"
      fb flex-col
      w-full min-h-24 px-8 pt-6 pb-2
      border="~ 2  gray opacity-40 hover:opacity-80"
      transition-all duration-500 ease-in-out
      hover:shadow
    >
      <div text-lg md-text-xl text-left base>
        {{ item.content }}
      </div>
      <div self-end italic fic text-sm text-gray4 base>
        {{ new Date(item.createTime).toDateString() }}
      </div>
    </div>
  </div>
</template>
