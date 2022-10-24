<script setup lang="ts">
import { useTitle } from '@vueuse/core'
import type { Article } from '~/types'

useTitle('PlantSechi | Posts')

function sortArticles(list: Article[]) {
  return list.sort((a, b) => {
    return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  })
}
</script>

<template>
  <div prose font-mono ma origin>
    <h1 text-2xl md-text-3xl base mb4>
      「 Posts 」
    </h1>
    <p ml-8 text-base base italic>
      something useless but import for me
    </p>
    <ContentList>
      <template #default="{ list }">
        <template v-for="article in sortArticles(list)" :key="article._id">
          <nuxt-link
            v-if="!article.draft"
            :to="article._path"
            important-no-underline
            block
            op-70
            hover:op-100
          >
            <h3 text-lg md-text-xl>
              {{ article.title }}
            </h3>
            <div italic fic text-sm text-gray4 fw-normal>
              {{ new Date(article.createTime).toDateString() }}
            </div>
          </nuxt-link>
        </template>
      </template>
      <template #not-found>
        Oops! Article is run away.
      </template>
    </ContentList>
  </div>
</template>
