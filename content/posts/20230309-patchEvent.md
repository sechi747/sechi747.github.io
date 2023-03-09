---
title: "Vue3源码浅析-patchEvent"
description: ""
uid: 526
createTime: 2023/03/09 21:55:24
updateTime: 2023/03/09 21:55:24
tag: ['Vue']
---
:ArticleToc
:ArticleHeader

今天在b站看到一个[视频](https://www.bilibili.com/video/BV1a54y137BY/?p=1&t=96&vd_source=3a17df1fbe3a2e47c31ace31550c2b10)，实现了 Vue3 中 `patchEvent` 函数的简易版，感觉十分精妙，于是去拜读了一下 Vue3 中的相关源码，简单水篇文章记录一下，源码位于 `packages\runtime-dom\src\modules\events.ts`

```typescript
export function patchEvent(
  el: Element & { _vei?: Record<string, Invoker | undefined> },
  rawName: string,
  prevValue: EventValue | null,
  nextValue: EventValue | null,
  instance: ComponentInternalInstance | null = null
) {
  // vei = vue event invokers
  // 读取el上的invokers，不存在则创建
  const invokers = el._vei || (el._vei = {})
  // 去找el上是否已经注册了同类型的事件监听器
  const existingInvoker = invokers[rawName]
  if (nextValue && existingInvoker) {
    // patch
    // el上已经注册了同类型的事件监听器，并且nextValue有值，那么就直接替换invoker.value
    existingInvoker.value = nextValue
  } else {
    // parseName()用于解析事件类型，比如@click，则最终返回['Click', undefine]
    // 同时parseName()也会对修饰符进行解析,比如@click.once，最终返回['click', {once: true}]
    const [name, options] = parseName(rawName)
    if (nextValue) {
      // add
      // 如果el上还没有监听该类型的事件，则创建一个invoker并进行映射
      const invoker = (invokers[rawName] = createInvoker(nextValue, instance))
      // 绑定事件真正的回调函数是invoker.value，而invoker.value的值即是参数中的nextValue
      addEventListener(el, name, invoker, options)
    } else if (existingInvoker) {
      // remove
      // 如果nextValue是null则解绑监听事件
      removeEventListener(el, name, existingInvoker, options)
      invokers[rawName] = undefined
    }
  }
}

function createInvoker(
  initialValue: EventValue,
  instance: ComponentInternalInstance | null
) {
  const invoker: Invoker = (e: Event & { _vts?: number }) => {
    // 下面这段注释解释了为什么要给event添加一个_vts属性以及给invoker添加attached属性
    // async edge case vuejs/vue#6566
    // inner click event triggers patch, event handler
    // attached to outer element during patch, and triggered again. This
    // happens because browsers fire microtask ticks between event propagation.
    // this no longer happens for templates in Vue 3, but could still be
    // theoretically possible for hand-written render functions.
    // the solution: we save the timestamp when a handler is attached,
    // and also attach the timestamp to any event that was handled by vue
    // for the first time (to avoid inconsistent event timestamp implementations
    // or events fired from iframes, e.g. #2513)
    // The handler would only fire if the event passed to it was fired
    // AFTER it was attached.
    if (!e._vts) {
      e._vts = Date.now()
    } else if (e._vts <= invoker.attached) {
      return
    }
    // 可以把callWithAsyncErrorHandling()简单理解为执行第一个参数的函数
    callWithAsyncErrorHandling(
      // patchStopImmediatePropagation()在这里会返回原函数，也就是invoker.value
      // 也就是说事件监听器的真正回调函数是invoker.value
      patchStopImmediatePropagation(e, invoker.value),
      instance,
      ErrorCodes.NATIVE_EVENT_HANDLER,
      [e]
    )
  }
  invoker.value = initialValue
  invoker.attached = getNow()
  return invoker
}

function patchStopImmediatePropagation(
  e: Event,
  value: EventValue
): EventValue {
  if (isArray(value)) {
    const originalStop = e.stopImmediatePropagation
    e.stopImmediatePropagation = () => {
      originalStop.call(e)
      ;(e as any)._stopped = true
    }
    return value.map(fn => (e: Event) => !(e as any)._stopped && fn && fn(e))
  } else {
    return value
  }
}
```

`patchEvent()` 有五个参数：

1. `el` 需要绑定事件的 `dom` 元素
2. `rawName` 监听的事件名，比如 `@click` 监听的事件名就是 `onClick`，而 `@click.once` 监听的是 `onClickOnce`
3. `preValue` 函数内并没有使用到该参数，猜测是指上一个事件回调函数
4. `nextValue` 需要绑定的事件回调函数
5. `instance` 组件实例

整体思想就是在元素上建立一个不同事件类型和对应回调函数的映射关系。通过 `createInvoker()` 函数来产生一个闭包，之后再进行相同类型的事件绑定时可以省略解绑事件的步骤，直接替换 `invoker.value` 的值来达到替换回调函数的目的。看完这部分源码之后真的是醍醐灌顶，对缓存的认知更上一层楼，也愈发感觉到自己确实笨

(～￣(OO)￣)ブ

最后放上简易版的实现代码，copy自[这里](https://github.com/Leizhenpeng/vue-design-trick/blob/master/03-function-cache/trick-event.js)

代码运行结果：

![image-20230309215401937](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20230309215401937.png)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vue desing trick 03 - function cache</title>
  </head>
  <body>
    <p><button id="btnTest">Test Button</button></p>
    <p>Way 1: <button id="btn1">Way 1 Start</button></p>
    <p>Way 2: <button id="btn2">Way 2 Start</button></p>

    <script>
           // Define an array of event listeners
      const listeners = Array.from({length: 400000}, (e, i) => ({
          e: 'click',
          f: ev => console.log(`${i+1}th binding - ${ev.target.innerHTML} ms`)
      }));

      const btnTest = document.querySelector('#btnTest');
      const button1 = document.querySelector('#btn1');
      const button2 = document.querySelector('#btn2');

      const getPrevious = (arr, i) => arr[i-1];
      const getNext = (arr, i) => arr[i];

      const plainBindEvent = (button = button1) => {
          for(let i = 1, len = listeners.length; i < len; i++) {
              const now = getNext(listeners, i);
              const prev = getPrevious(listeners, i);
              button.addEventListener(
                  now.e,
                  now.f
              );
              button.removeEventListener(
                  prev.e,
                  prev.f
              );
          }
      };

      // keyword: vue event invoker / patchEvent
      const vei = {};

      const cacheBindEvent = (button = button2) => {
          for(let i = 1, len = listeners.length; i < len; i++) {
              const now = getNext(listeners, i);
              let invoker = vei[now.e];

              if(invoker) {
                  invoker.value = now.f;
                  continue;
              }

              if(!invoker) {
                  invoker = e => invoker.value(e);
                  invoker.value = now.f;
                  button.addEventListener(now.e, invoker);
                  vei[now.e] = invoker;
              }
          }
      };

      // Test case
      const wrapTimer = (fn, btn) => (event, ...args) => {
          const t = Date.now();
          fn(...args);
          btn.innerHTML = `total used ${Date.now() - t} ms`;
      }

      const fn1 = wrapTimer(plainBindEvent, button1);
      const fn2 = wrapTimer(cacheBindEvent, button2);
      btnTest.addEventListener('click', () => {
          button1.addEventListener('click', fn1());
          button2.addEventListener('click', fn2());
      });
    </script>
  </body>
</html>
```

