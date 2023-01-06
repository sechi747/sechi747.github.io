export const useDarkToggle = createSharedComposable(() => {
  const color = useColorMode()

  function toggleDark() {
    color.value = color.value === 'dark' ? 'light' : 'dark'
  }

  return { color, toggleDark }
})
