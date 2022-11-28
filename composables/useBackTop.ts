export const useBackTop = (
  visibilityHeight: number,
) => {
  const el = shallowRef<HTMLElement>()
  const container = shallowRef<Document | HTMLElement>()
  const visible = ref(false)

  const scrollToTop = () => {
    if (el.value)
      el.value?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (el.value)
      visible.value = el.value.scrollTop >= visibilityHeight
  }

  const handleScrollThrottled = useThrottleFn(handleScroll, 200, true)

  useEventListener(container, 'scroll', handleScrollThrottled)

  onMounted(() => {
    container.value = document
    el.value = document.documentElement
  })

  return {
    visible,
    scrollToTop,
  }
}
