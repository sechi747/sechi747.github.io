<script setup lang="ts">
import { useTitle } from '@vueuse/core'
import { JsonFile } from '~~/types'

useTitle('PlantSechi | Moments')
const { data } = await useAsyncData('moments', () => queryContent<JsonFile>('/moments').findOne())

const resolveList = (list: JsonFile) => {
  const momentsList: Array<{ createTime: number; content: string }> = []
  for (const [key, value] of Object.entries(list)) {
    if (/^\d{13}/.test(key))
      momentsList.push({ createTime: Number(key), content: value as string })
  }
  return momentsList.sort((a, b) => b.createTime - a.createTime)
}
</script>

<template>
  <div prose font-mono ma origin>
    <DefaultHeader title="Moments" description="try to catch something fleeting" />
    <div
      v-for="item in resolveList(data as JsonFile)"
      :key="item.createTime"
      fa flex-col
      w-full min-h-24 px-4 py-2
      border="~ 1  gray opacity-40 hover:opacity-80 "
      box-shadow
    >
      <div text-lg md-text-xl>
        {{ item.content }}
      </div>
      <div self-end italic fic text-sm text-gray4>
        {{ new Date(item.createTime).toDateString() }}
      </div>
    </div>
  </div>
</template>
