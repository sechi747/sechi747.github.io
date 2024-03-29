export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/content',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'author', content: 'sechi' },
        { name: 'description', content: 'PlantSechi is a personal blog which is focus on front-end.' },
      ],
    },
  },

  content: {
    highlight: {
      theme: 'vitesse-dark',
      langs: ['json', 'js', 'ts', 'html', 'css', 'vue', 'shell', 'bash', 'mdc', 'md', 'yaml', 'dart', 'java'],
    },
    markdown: {
      toc: {
        depth: 4,
        searchDepth: 4,
      },
      // anchorLinks: {
      //   depth: 3,
      //   exclude: [2],
      // },
      anchorLinks: true,
    },
    documentDriven: true,
  },

  unocss: {
    preflight: true,
  },

  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode',
  },
})
