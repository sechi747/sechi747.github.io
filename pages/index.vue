<script lang="ts" setup>
import { useTitle } from '@vueuse/core'

const { data: user } = await useFetch('/api/user')

useTitle('PlantSechi')
</script>

<template>
  <div prose font-mono ma mt-10>
    <div flex flex-col items-center md="gap-10 flex-row">
      <img
        w-30
        h-30
        md="w-50 h-50"
        rounded-full
        :src="user?.avatar_url"
        alt="github_account_avatar"
      >
      <div>
        <h1 fic justify-center md="justify-start">
          {{ user?.name }}
        </h1>
        <p text-lg text-center md="text-left">
          {{ user?.bio }}
        </p>

        <div my-4 fic justify-center md="justify-start">
          <div i-carbon-user-favorite-alt-filled mr2 />
          <span>
            {{ user?.followers }}
            <span class="text-xs">
              followers
            </span>
          </span>
          <span mx-2>·</span>
          <span>
            {{ user?.following }}
            <span class="text-xs">
              following
            </span>
          </span>
        </div>
        <p />
      </div>
    </div>

    <p>
      👋 Hi there I'm Siqi Chen (Sechi). A novice Front-end Engineer
    </p>
    <p>✨ Focusing on Vue related ecology.</p>
    <p>🧐 I'm also learning TypeScript, Node.js and React recently. </p>
    <p>👾 I'm currently interested in Overwatch2. </p>
  </div>
</template>
