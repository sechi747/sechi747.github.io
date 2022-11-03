import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['btn', 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-250 ease-in-out hover:opacity-100'],

    ['trans', 'transition-all-250 ease-linear'],
    ['text', 'text-text-default dark:text-text-dark'],
    ['bg', 'trans bg-bg-default dark:bg-bg-dark'],
    ['base', 'trans text'],

    ['pr', 'relative'],
    ['pa', 'absolute'],
    ['pf', 'fixed'],
    ['p-c', 'pa top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'],

    ['f-c', 'flex justify-center items-center'],
    ['f-c-c', 'f-c flex-col'],
    ['fc', 'flex justify-center'],
    ['fcc', 'flex justify-center items-center'],
    ['fs', 'flex justify-start'],
    ['fsc', 'flex justify-start items-center'],
    ['fe', 'flex justify-end'],
    ['fec', 'flex justify-end items-center'],
    ['fb', 'flex justify-between'],
    ['fbc', 'flex justify-between items-center'],
    ['fw', 'flex justify-wrap'],
    ['fwr', 'flex justify-wrap-reverse'],
    ['fa', 'flex justify-around'],
    ['fac', 'flex justify-around items-center'],
    ['fic', 'flex items-center'],
    ['fccc', 'flex justify-center items-center flex-col'],

    ['header-anchor', 'float-left ml-[-0.8em] pr-[0.2em] text-[0.85em] op-0 group-hover-op-60 fw-600'],
  ],
  theme: {
    fontFamily: {
      mono: 'dm,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
    },
    colors: {
      bg: {
        default: '#fefefe',
        dark: '#1c1f24',
      },
      text: {
        default: '#3b3b3b',
        dark: '#C8CCD0',
      },
      primary: '#26a69a',
    },
    boxShadow: {
      switch: '0 0 0 2px rgba(24, 160, 88, 0.2)',
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography({
      cssExtend: {
        'a': {
          'text-decoration-color': 'rgba(38, 166, 154,0.4);',
        },
        'a:hover': {
          'text-decoration-color': 'rgba(38, 166, 154,0.7);',
        },
        'pre': {
          background: '#23272d !important',
        },
        'blockquote': {
          'border-left': '0.25em solid rgb(38, 166, 154)',
        },
      },
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
