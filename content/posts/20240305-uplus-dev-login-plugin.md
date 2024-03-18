---
title: "如何使用 vue-demi 实现一个 Vue2/3 兼容的模拟登录组件"
description: ""
uid: 531
createTime: 2024/03/05 20:44:31
updateTime: 2024/03/05 20:44:31
tag: ['Vue', '开源']
---
:ArticleToc
:ArticleHeader

## 背景

先说一个场景：xx平台的生产环境出现了一个 bug，而这个 bug 必须使用特定账号才能复现，在不向用户要密码的前提下我们只能使用模拟登录来排查。但如果在生产环境的管理后台使用模拟登录只能跳转到xx平台的生产环境，如果想对代码进行 debug 就只能本地启动后台管理项目，然后修改模拟登录部分的代码，再跳转到本地启动好的xx平台项目。所以有没有一种可能，我们只需要写好一个组件放到xx项目里就能完成模拟登录操作？



组件的思路很简单，只需要一个登录界面和一个用户查询界面以及一个模拟登录按钮就可以。涉及到的接口满打满算也就四个，看上去实在是太简单了。但是，考虑到未来项目有可能从 Vue2 升级到 Vue3，所以我做了一个违背祖宗的决定：这个组件需要同时适配两个版本的 Vue。最开始的想法是用 monorepo 维护两个版本的包，但这也意味着每出现一个问题都要修改两个地方。所以我将目光投向了 antfu 开源的 [vue-demi](https://github.com/vueuse/vue-demi)。



**Vue Demi** (*half* in French) is a developing utility allows you to write **Universal Vue Libraries** for Vue 2 & 3



## 搭建框架

鉴于组件的逻辑和 UI 并不复杂，我们应该尽可能减少代码的外部依赖，UI 使用原生的 css 完成，接口请求使用 fetch，打包工具选择轻量级的 unbuild，项目使用 typescript + eslint 来规范代码。此外我们还需要一个 playground 目录来进行调试，可以直接使用 vite 的 vue-ts 模板来快速生成并在 `pnpm-workspace.yaml`中将其设为子包。

初始化完成后的目录结构如下：

![img](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/uplus-dev-login-1.png?q-sign-algorithm=sha1&q-ak=AKID93q7aYfXDSWCD8kxWaooKIqlTwxpQXQ5Bmv3NJ4gEwnAHFqESQcmnwGafAQJZBHO&q-sign-time=1709642377;1709645977&q-key-time=1709642377;1709645977&q-header-list=host&q-url-param-list=ci-process&q-signature=40bf8682c3c0f0767c5b5738835899c3beff0d9d&x-cos-security-token=SJnk1hFasC3k7O6ESYC8RGt86C9gSRna7bcafd0a86e54aa26fa7dc2908a1c1f0e_SFq3xlv0ejVF_3Jdbd_5HpgrgtThVPzXk__j-fqUyQ4aAGO1ScqUScG7SZNm2XlO1pKVESlNvInhxCV4bAYPfCUyanXgjvZxYzyqyTmvBUuHPEGFlDDp8v76IGYxpJp0Wn3i9eC_ES48fBf81HkDLDNI5UYVyzbDESInl6WD6sDTizS2tbf4ettHUBuBrd&ci-process=originImage)

package.json 如下：

```json
{
  "name": "uplus-dev-login-plugin",
  "version": "0.2.8",
  "description": "",
  "scripts": {
    "build": "pnpm unbuild",
    "dev": "cd ./playground && pnpm dev",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "sideEffects": false,
  "exports": {
    ".": {
      "import": "./dist/index.mjs"
    },
    "./index.css": {
      "import": "./dist/index.css"
    }
  },
  "type": "module",
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "dependencies": {
    "jsencrypt": "^3.3.2",
    "vue-demi": "^0.14.5"
  },
  "peerDependencies": {
    "@vue/composition-api": "^1.7.1",
    "vue": "^2.0.0 || >=3.0.0"
  },
  "peerDependenciesMeta": {
    "@vue/composition-api": {
      "optional": true
    }
  },
  "devDependencies": {
    "@antfu/eslint-config": "^0.39.5",
    "eslint": "^8.42.0",
    "typescript": "^5.1.3",
    "unbuild": "^1.2.1",
    "vue": "^3.3.4"
  }
}
```

相较于 rollup 和 webpack，unbuild 的打包配置可以算是傻瓜式了。

```typescript
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({

  entries: [
    // 主入口，使用 rollup打包
    './src/index',
    // css 则直接拷贝到 dist 中
    {
      builder: 'mkdist',
      input: './src/style/',
      outDir: './dist',
    },
  ],

  clean: false,

  // 生成 .d.ts 文件
  declaration: true,

  rollup: {
    // 目前不考虑 commonJS
    emitCJS: false,
    esbuild: {
      // 代码压缩
      minify: true,
    },
  },
})
```

为了在 playground 中使用项目打包后的文件调试，我们需要在 package.json 指定组件的依赖为 `workspace:*`:

```json
"dependencies": {
  "vue": "^3.2.47",
  "uplus-dev-login-plugin": "workspace:*"
},
```

至此，基本框架就已经完成了，可以正式开始踩坑之路了

## vue-demi 基本用法

vue-demi 使用起来还算简单，和 Vue3 的组合式写法基本一致。

```typescript
import { defineComponent, computed, ref } from 'vue'
// 替换为
import { defineComponent, computed, ref } from 'vue-demi'
```

值得注意的是，使用 vue-demi 写 SFC 组件可能会出现各种各样的问题，所以我们干脆就使用 defineComponent + h 来编写组件，而这也为后续的踩坑埋下了伏笔。

我们先简单看一下使用 defineComponent + h 函数和 SFC 实现一个组件有什么不同：

```vue
<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)

const increase = () => {
  count.value++
}
</script>

<template>
  <div>
    <h1>{{ msg }}</h1>
    <span>{{ count }}</span>
    <button @click="increase">
      +
    </button>
  </div>
</template>
import { defineComponent, h, ref } from 'vue-demi'

export const Test = defineComponent({
  props: {
    msg: {
      type: String,
    },
  },

  setup(props, { slots }) {
    const count = ref(0)

		const increase = () => {
  		count.value ++
		}

    return {
      slots,
      props,
      count,
      increase,
    }
  },
  render() {
    return h(
      'div',
      [
        h('h1', this.props.msg),
        h('span', this.count),
        h('button, { onClick: this.increase }, '+')
      ]
    )
  },
})
```

通过对比我们可以发现，在 script 部分两者的差异并不大，差异主要体现在 template 部分的编写。我们需要在 render 函数里使用 h 函数来拼接各个节点，这也导致 render 函数的可读性远远不如 template 语法。

虽然写起来比较麻烦，但好歹能跑起来。在我写完了几个组件后，我尝试在 playground 中运行，不出意外运行地很顺利，于是我信心满满地把包发布到了 npm，并装进了 front 项目里。随着我内心怒喊一句：front, 启动！果然，毫不意外地出了点意外。

## 踩坑记录

### 坑1

第一位出场的选手就是重量级：组件上绑定的点击事件无法触发并且 input 框里的 placeholder 不见了。

出于对 vue-demi 的信任以及组件可以在 playground 里正常运行的事实，我首先怀疑是打包出了问题，但经过仔细排查后发现并不是。之后我把目光投在了 h 函数这个浓眉大眼的小伙子身上，经过我的严刑拷打，这小子终于招了：其实 [Vue2](https://v2.cn.vuejs.org/v2/guide/render-function.html#深入数据对象) 和 [Vue3](https://cn.vuejs.org/guide/extras/render-function.html#creating-vnodes) 的 h 函数参数并不一致。我们需要关注的主要有：

- 绑定事件

```typescript
// vue3
h('div', { onClick: handleClick }, '点我')
// vue2
h('div', { on: { click: handleClick } }, '点我')
```

- 普通的 HTML attribute 如 src, type, placeholder, id等

```typescript
// vue3
h('input', { type: 'password', placeholder: '请输入密码' })
// vue2
h('input', { attrs: { type: 'password', placeholder: '请输入密码' } })
```

- 传递 props

```typescript
// vue3
h(UserTable, { userList: this.userList })
// vue2
h(UserTable, { props: { userList: this.userList } })
```

为了不需要在每个 h 函数中处理这些问题，我们可以写一个函数来统一处理：

```typescript
export function transformVNodeProps(properties: Record<string, any>, propsObj?: Record<string, any>) {
  const ATTR_NAMES = ['src', 'type', 'id', 'placeholder']
  
  if (!isVue2)
    return { ...properties, ...propsObj }
  const on: Record<string, any> = {}
  const attrs: Record<string, string> = {}
  const props: Record<string, any> = {}

  Object.keys(properties)
    .filter(event => /^on[A-Z]/.test(event))
    .forEach((event) => {
      const eventName = event[2].toLowerCase() + event.substring(3)
      on[eventName] = properties[event]
    })
  properties.on = Object.assign({}, on, properties.on || {})

  ATTR_NAMES
    .filter(name => properties[name] !== undefined)
    .forEach((name) => {
      attrs[name] = properties[name]
    })
  properties.attrs = Object.assign({}, attrs, properties.attrs || {})

  if (propsObj !== undefined) {
    Object.keys(propsObj).forEach((key) => {
      props[key] = propsObj[key]
    })
    properties.props = Object.assign({}, props, propsObj || {})
  }

  return properties
}
```

之后我们在使用 h 函数时只需要把第二个参数包裹一下就可以实现 Vue2/3 的兼容了

```typescript
h(
	Dialog,
	transformVNodeProps({ id: 'dev-main-modal', onClose: this.showConfirmDialog }, { showFooterButtons: false }),
	[h(SimulateLoginPlugin)],
),
```

### 坑2

第二个坑和第一个坑其实类似，也是一个兼容性问题：组件的 slot 没有渲染。

这里不再赘述，直接说原因和解决方法。

```typescript
// Vue3 的 slots 里的每一个插槽都是一个函数，而 Vue2 则是对象
// vue3
h(UserTable, this.slots.default())
// vue2
h(UserTable, this.slot.default)
```

和第一个坑一样，我们再编写一个函数来统一处理就好了

```typescript
export function transformVNodeSlots(slots: Record<string, any>, name = 'default') {
  if (typeof slots[name] === 'function')
    return slots[name]()
  else
    return slots[name]
}

h(UserTable, transformVNodeSlots(this.slots))
```

### 坑3

接下来向我们走来的这位选手很面熟啊，仔细一看，这不还是 h 函数吗！你小子挺能挖坑啊？！

在 Dialog 组件中需要用到几个图标，为了节约打包体积，我偷了个懒直接使用 css 绘制进行绘制。

```typescript
h(
	'div',
	transformVNodeProps({ class: 'dev-login-trigger', onClick: this.showMainDialog }),
  // 正常情况下应该渲染出图标
	h('div', { class: 'dev-login-profile-icon' })
)
```

果然不出我所料，这段代码在 playground 中运行没有任何问题，一到 front 里就开始玩隐身了。页面上根本就没有渲染出 `<div class="dev-login-profile-icon"></div>`。

这次我直接都没思考，直接就把矛头就指向了 h 函数。可这次即使我把文档翻了个遍也没能找到问题所在，直到我看见了文档中一段略显奇怪的代码：

![img](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/uplus-dev-login-2.png?q-sign-algorithm=sha1&q-ak=AKIDcZAiF4drnbBU5_AScIJtpHBRyNNDAXZuwj7WAPvnhajFSvUfUxbs4eh5vrZB49WB&q-sign-time=1709642412;1709646012&q-key-time=1709642412;1709646012&q-header-list=host&q-url-param-list=ci-process&q-signature=d43abeb9b645948a30405ce83bf49157ca9f941a&x-cos-security-token=SJnk1hFasC3k7O6ESYC8RGt86C9gSRna290bb4c564d9e1a947a03bd7361dca04e_SFq3xlv0ejVF_3Jdbd_81jPYqOYu3VZU8J0Jab8QGC0lwC-hNmfiX6Ph7YsSZiftcEklUx6jdvzydCBLyDkAucBFIUWfda7fG-7CO1s1TKy5oimwQ_sfqCqjDGGuLGbvbp4KpdQhE7f2rNPQnsCfUCNZZoOM_R6KKdoNEWx860WrTUgArudOTkXMn-dZZiSey2oAYcJ9NA-InAf5OAvA&ci-process=originImage)

为什么这里明明只在内部渲染了一个元素也要用数组来包裹呢？总不能 api 设计就如此吧？没想到还真是....

只需要给 children 参数包裹成数组就可以在 Vue2 中正常渲染了

```typescript
h(
	'div',
	transformVNodeProps({ class: 'dev-login-trigger', onClick: this.showMainDialog }),
	[h('div', { class: 'dev-login-profile-icon' })]
)
```

### 坑4

对于需要在项目中直接引用的组件，我们需要给它一个 **name** 属性，否则会在 Vue2 项目中报错。

```typescript
import { defineComponent, h } from 'vue-demi'

export const Test = defineComponent({
	name: 'Test',
  render() {
    return h(
      'div',
      'Test'
    )
  },
})
```

## uplus-dev-login-plugin

### 使用

接下来简单介绍一下 `uplus-dev-login-plugin`的使用方法：

1. 首先将依赖安装到项目中 

```plain
npm i uplus-dev-login-plugin
// 对于使用 Vue2.6 的项目还需要额外安装@vue/composition-api (2.7 || 3.0 则不需要安装)
npm i @vue/composition-api
```

1. 在 vue.config.js 中添加一项 webpack 配置：

```javascript
configureWebpack: {
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      }
    ]
  }
},
```

1. 由于组件内调用的接口处在 admin 服务下，而生产环境的 admin 服务无法通过 U+ 的域名直接访问(tev、uea 均可直接通过 U+ 的域名访问)，所以我们需要给 `/api/admin`单独配置一个代理，需要根据启动环境的不同来设置不同的 gateway：

```javascript
// const gateway = 'https://xx.yy.zz' // tev环境
const gateway = 'https://zz.yy.xx' // 生产环境

proxy: {
	'/api/admin': {
		target: gateway,
		changeOrigin: true,
		secure: false,
	},
},
```

1. 在 App.vue (或者其他你喜欢的组件)中使用组件：

```vue
<script>
import { Trigger } from 'uplus-dev-login-plugin'
import 'uplus-dev-login-plugin/dist/index.css'
import { basePath } from '@/util/utils'

export default {
  components: { Trigger },
  data() {
    	return {
      	basePath
    	}
  	},
  computed: {
    	showTrigger() {
      // 仅在本地开发环境显示组件
      	return process.env.NODE_ENV === 'development'
    	}
  	}
}
</script>

<template>
  <div>
    <!-- 需要传入basePath兼容单域名环境 -->
    <Trigger v-if="showTrigger" :base-path="basePath" />
  </div>
</template>
```

### 效果预览

引入后会在右下角出现一个悬浮的按钮，点击后会出现弹窗

![img](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/uplus-dev-login-3.png?q-sign-algorithm=sha1&q-ak=AKIDAB6jXmgRb1ndGwohUfVR-7rfh0A10uJ_8gmSsFTYSPqOoWR3ZBxwD0UYjARQhIBN&q-sign-time=1709642424;1709646024&q-key-time=1709642424;1709646024&q-header-list=host&q-url-param-list=ci-process&q-signature=e96a17c274c102d297117c9da6c78b07f8fe8009&x-cos-security-token=SJnk1hFasC3k7O6ESYC8RGt86C9gSRna5e56379685a629b61f2d4e72463364fae_SFq3xlv0ejVF_3Jdbd_5yD0Vqz2usS2iZU5wa55kk9louBMrHCZjJsagFtdbsB9G2d3XovZd6Xg_8IlUVdQ5JrYHosxKaM7iBpXX6l4ghY7OSaTPgcTADWE0h7yC48q8pz_5W-lngvt7XXc9XGUARG_GcMKGdg8VDYUXPnEI1O2jQ07PgtEUh2I_tOqnwL&ci-process=originImage)

![img](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/uplus-dev-login-4.png?q-sign-algorithm=sha1&q-ak=AKID95ooOF_cD-dSYPOfbRVPh7cEzjHGQ-eYVtxE4MSgmTWIa7z1k_kEplrps4ItJvgl&q-sign-time=1709642435;1709646035&q-key-time=1709642435;1709646035&q-header-list=host&q-url-param-list=ci-process&q-signature=fde2c7a3abd8c3f15aec8a080cc883a0ccc42f4c&x-cos-security-token=SJnk1hFasC3k7O6ESYC8RGt86C9gSRna75ebbc30639dc2440bf2abdef69e0dcce_SFq3xlv0ejVF_3Jdbd_4RQ4lppXc5S71c1Ge8rRtnGV2LftiF3WTvA4T294F1BXJ6aG9zSfWvqUtJa2hbLWQHuF4gwN5MF-HW8YL1yEshMaHp3G2vVBkfi7xmQ9SlLuZjCtyL-ANa135_m-IF9jGblFnHNMyu4w11NKfOLmDkQZIP_CksPl2jwhACXvD62ZFYeIl7bioyZOs3qw5HJpg&ci-process=originImage)

输入后台管理的账号密码后即可查询用户并模拟登录。查询条件为【账号 | 姓名 | 学号 | 手机号】。列表中账号和姓名使用 `||` 进行分隔。

![img](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/uplus-dev-login-4.png?q-sign-algorithm=sha1&q-ak=AKID95ooOF_cD-dSYPOfbRVPh7cEzjHGQ-eYVtxE4MSgmTWIa7z1k_kEplrps4ItJvgl&q-sign-time=1709642435;1709646035&q-key-time=1709642435;1709646035&q-header-list=host&q-url-param-list=ci-process&q-signature=fde2c7a3abd8c3f15aec8a080cc883a0ccc42f4c&x-cos-security-token=SJnk1hFasC3k7O6ESYC8RGt86C9gSRna75ebbc30639dc2440bf2abdef69e0dcce_SFq3xlv0ejVF_3Jdbd_4RQ4lppXc5S71c1Ge8rRtnGV2LftiF3WTvA4T294F1BXJ6aG9zSfWvqUtJa2hbLWQHuF4gwN5MF-HW8YL1yEshMaHp3G2vVBkfi7xmQ9SlLuZjCtyL-ANa135_m-IF9jGblFnHNMyu4w11NKfOLmDkQZIP_CksPl2jwhACXvD62ZFYeIl7bioyZOs3qw5HJpg&ci-process=originImage)

关闭弹窗时会询问是否需要在当前会话中移除组件，如果选择“是”的话，则在本次会话中都将不再渲染组件，需要关闭后重新打开网页才会重新渲染。

![img](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/uplus-dev-login-4.png?q-sign-algorithm=sha1&q-ak=AKID95ooOF_cD-dSYPOfbRVPh7cEzjHGQ-eYVtxE4MSgmTWIa7z1k_kEplrps4ItJvgl&q-sign-time=1709642435;1709646035&q-key-time=1709642435;1709646035&q-header-list=host&q-url-param-list=ci-process&q-signature=fde2c7a3abd8c3f15aec8a080cc883a0ccc42f4c&x-cos-security-token=SJnk1hFasC3k7O6ESYC8RGt86C9gSRna75ebbc30639dc2440bf2abdef69e0dcce_SFq3xlv0ejVF_3Jdbd_4RQ4lppXc5S71c1Ge8rRtnGV2LftiF3WTvA4T294F1BXJ6aG9zSfWvqUtJa2hbLWQHuF4gwN5MF-HW8YL1yEshMaHp3G2vVBkfi7xmQ9SlLuZjCtyL-ANa135_m-IF9jGblFnHNMyu4w11NKfOLmDkQZIP_CksPl2jwhACXvD62ZFYeIl7bioyZOs3qw5HJpg&ci-process=originImage)

### 源码地址

https://github.com/sechi747/uplus-dev-login-plugin