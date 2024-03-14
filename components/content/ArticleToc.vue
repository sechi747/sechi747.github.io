<script lang='ts' setup>
const { toc } = useContent()
const router = useRouter()
const tocRef = ref()

const hasToc = computed(() => toc.value?.links && toc.value.links.length > 0)

onMounted(() => {
  if (!hasToc.value)
    return
  const navigate = () => {
    if (location.hash) {
      document.querySelector(decodeURIComponent(location.hash))
        ?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleAnchors = (event: MouseEvent & { target: HTMLElement }) => {
    const link = event.target.closest('a')

    if (
      !event.defaultPrevented
      && link
      && event.button === 0
      && link.target !== '_blank'
      && link.rel !== 'external'
      && !link.download
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey
    ) {
      const url = new URL(link.href)
      if (url.origin !== window.location.origin)
        return

      event.preventDefault()
      const { pathname, hash } = url
      if (hash && (!pathname || pathname === location.pathname)) {
        window.history.replaceState({}, '', hash)
        navigate()
      }
      else {
        router.push({ path: pathname, hash })
      }
    }
  }

  useEventListener(window, 'hashchange', navigate)
  useEventListener(tocRef.value!, 'click', handleAnchors, { passive: false })

  navigate()
  setTimeout(navigate, 500)
})
</script>

<template>
  <div pf right-10 text-sm hidden lg-block>
    <ul v-if="hasToc" ref="tocRef" list-none>
      <li font-italic>
        Table of Contents
      </li>
      <li v-for="link in toc.links" :key="link.text">
        <a
          :href="`#${link.id}`"
          op-70 hover-op-100
          inline-block no-underline
          max-w-60 truncate
        >
          {{ link.text }}
        </a>

        <ul v-if="link.children && link.children.length" my-1 list-none>
          <li v-for="child in link.children" :key="child.text">
            <a
              :href="`#${child.id}`"
              op-70 hover-op-100
              inline-block no-underline
              max-w-60 truncate
            >
              {{ child.text }}
            </a>

            <ul v-if="child.children && child.children.length" my-1 list-none>
              <li v-for="subChild in child.children" :key="subChild.text">
                <a
                  :href="`#${subChild.id}`"
                  op-70 hover-op-100
                  inline-block no-underline
                  max-w-60 truncate
                >
                  {{ subChild.text }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
