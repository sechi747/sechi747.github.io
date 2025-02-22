<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content/types'

function sortArticles(list: ParsedContent[]) {
  return list.filter(a => a._extension === 'md').sort((a, b) => {
    return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  })
}
</script>

<template>
  <div prose font-mono ma origin>
    <DefaultHeader title="Posts" description="something useless but important for me" />
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
              {{ new Date(article.updateTime).toDateString() }}
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
