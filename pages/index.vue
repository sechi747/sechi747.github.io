<script lang="ts" setup>
const { data: user } = await useFetch('/api/user')

useHead({ title: 'PlantSechi' })
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
        <h1 fic justify-center base md="justify-start">
          {{ user?.name }}
        </h1>
        <p text-lg text-center md="text-left">
          {{ user?.bio }}
        </p>

        <div my-4 fic justify-center md="justify-start">
          <div i-carbon-user-favorite-alt-filled mr2 base />
          <span base>
            {{ user?.followers }}
            <span class="text-xs">
              followers
            </span>
          </span>
          <span mx-2 base>·</span>
          <span base>
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
      👋 Hi there. I'm Sechi. A novice Front-end Engineer.
    </p>
    <p>✨ Focusing on Vue related ecology.</p>
    <p>🧐 I'm also learning TypeScript, Node.js and React recently. </p>
    <p>👾 I'm currently interested in Overwatch2 (but it will gone soon😅). </p>
    <p>🎮 Welcome to add my steam friends! My SteamID is 76561198863705753</p>
    <p>🎹 Currently learning piano by myself.</p>

    <img width="450" height="170" alt="steam_card" src="https://card.yuy1n.io/card/76561198863705753/tokyonight,en,badge,text-9ea1a5,bg-2d3034">
  </div>
</template>
