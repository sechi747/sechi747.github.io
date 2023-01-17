---
title: "关于 Vue3 中的 EffectScope"
description: ""
uid: 513
createTime: 2022/08/08 00:08:32
updateTime: 2022/08/08 00:08:32
tag: ['Vue']
---
:ArticleToc
:ArticleHeader

时隔三个月后的第一篇博客，希望能终止我的颓势，让我能再向上爬一些。

最近在写公司业务的时候使用了 `vueuse` 中的 `createSharedComposable` 这个方法，用起来十分的顺手。于是乎找到了这个方法源码来读一读，然后发现读不懂...整个方法的实现不过20行代码，看起来十分简洁。其中最核心的部分就是引用的 Vue3.2 的新特性：`EffectScope` 。去翻了翻 Vue 文档，发现这个特性居然 antfu 大佬亲自提出来的，属于是自产自销了。

简单读了一下 `EffectScope` 的 RFC（主要是想深入读也没那个能力XD），终于是对这个方法有了一点头绪。

首先看一下 `createSharedComposable` 方法的实现：

```typescript
import type { EffectScope } from 'vue-demi'
import { effectScope } from 'vue-demi'
import { tryOnScopeDispose } from '../tryOnScopeDispose'

/**
 * Make a composable function usable with multiple Vue instances.
 *
 * @see https://vueuse.org/createSharedComposable
 */
export function createSharedComposable<Fn extends((...args: any[]) => any)>(composable: Fn): Fn {
  let subscribers = 0
  let state: ReturnType<Fn> | undefined
  let scope: EffectScope | undefined

  const dispose = () => {
    subscribers -= 1
    if (scope && subscribers <= 0) {
      scope.stop()
      state = undefined
      scope = undefined
    }
  }

  return <Fn>((...args) => {
    subscribers += 1
    if (!state) {
      scope = effectScope(true)
      state = scope.run(() => composable(...args))
    }
    tryOnScopeDispose(dispose)
    return state
  })
}
```

方法中定义了三个变量：`subscribers` 代表使用这个 composable 的组件数量，`state` 是被传入的方法的返回值， `scope` 则是上面提到的 `EffectScope` 

该方法接收一个函数作为参数，返回值也是一个函数。首先将 `subscribers ++` ，然后去判断当前是否已经存在了 `EffectScope`， 如果存在的话那就只绑定一个解绑事件并返回 `state` ，如果不存在的话，则创建一个 `EffectScope`，并执行 `scope.run` 来获取传入的函数的返回值。

然后就是对 `EffectScope` 的相关概念讲解，此部分来自官方 RFC

#### 出现的原因

在 Vue 的 setup 中，响应会在开始初始化的时候被收集，在实例被卸载的时候，响应就会自动的被取消追踪，这是一个很方便的特性。但是，当我们在组件外使用或者编写一个独立的包时，这会变得非常麻烦。当在单独的文件中，我们该如何停止 computed & watch 的响应式依赖呢？

在 Vue3.2 之前： 

```js
const disposables = []

const counter = ref(0)
const doubled = computed(() => counter.value * 2)

disposables.push(() => stop(doubled.effect))

const stopWatch1 = watchEffect(() => {
  console.log(`counter: ${counter.value}`)
})

disposables.push(stopWatch1)

const stopWatch2 = watch(doubled, () => {
  console.log(doubled.value)
})

disposables.push(stopWatch2)
```

`EffectScope` 实现：

```js
// effect, computed, watch, watchEffect created inside the scope will be collected

const scope = effectScope()

scope.run(() => {
  const doubled = computed(() => counter.value * 2)

  watch(doubled, () => console.log(doubled.value))

  watchEffect(() => console.log('Count: ', doubled.value))
})

// to dispose all effects in the scope
scope.stop()
```

#### 如何使用

一个 scope 可以执行一个 run 函数（接受一个函数作为参数，并返回该函数的返回值），并且捕获所有在该函数执行过程中创建的 effect ，包括可以创建 effect 的API，例如 `computed` , `watch` , `watchEffect` :

```js
const scope = effectScope()
scope.run(() => {
  const doubled = computed(() => counter.value * 2)

  watch(doubled, () => console.log(doubled.value))

  watchEffect(() => console.log('Count: ', doubled.value))
})

// the same scope can run multiple times
scope.run(() => {
  watch(counter, () => {
    /* ... */
  })
})
```

当调用 `scope.stop()` 时，所有被捕获的 effect 都会被取消，包括 Nested Scopes 也会被递归取消。

嵌套 scope 也会被他们的父级 scope 收集。并且当父级 scope 销毁的时候，所有的后代 scope 也会被递归销毁。

```js
const scope = effectScope()

scope.run(() => {
  const doubled = computed(() => counter.value * 2)

  // not need to get the stop handler, it will be collected by the outer scope
  effectScope().run(() => {
    watch(doubled, () => console.log(doubled.value))
  })

  watchEffect(() => console.log('Count: ', doubled.value))
})

// dispose all effects, including those in the nested scopes
scope.stop()
```

`EffectScope` 接受一个参数可以在分离模式（detached mode）下创建。 Detached Scope不会被父级收集。

```js
let nestedScope

const parentScope = effectScope()

parentScope.run(() => {
  const doubled = computed(() => counter.value * 2)

  // with the detected flag,
  // the scope will not be collected and disposed by the outer scope
  nestedScope = effectScope(true /* detached */)
  nestedScope.run(() => {
    watch(doubled, () => console.log(doubled.value))
  })

  watchEffect(() => console.log('Count: ', doubled.value))
})

// disposes all effects, but not `nestedScope`
parentScope.stop()

// stop the nested scope only when appropriate
nestedScope.stop()
```

全局钩子函数 `onScopeDispose` 提供了类似于 `onUnmounted` 的功能，不同的是它工作在 `scope` 中而不是当前实例。

这使得 composable functions 可以通过他们的 `scope` 清除他们的副作用。

由于 `setup()` 默认会为当前实例创建一个 `scope`，所以当没有明确声明一个 `scope` 的时候，`onScopeDispose `等同于 `onUnmounted`。

```js
import { onScopeDispose } from 'vue'

const scope = effectScope()

scope.run(() => {
  onScopeDispose(() => {
    console.log('cleaned!')
  })
})

scope.stop() // logs 'cleaned!'
```

通过 `getCurrentScope()` 可以获取当前 scope

```js
import { getCurrentScope } from 'vue'

getCurrentScope() // EffectScope | undefined
```

