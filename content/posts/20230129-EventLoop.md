---
title: "JavaScript 事件循环"
description: ""
uid: 518
createTime: 2023/01/29 14:48:15
updateTime: 2023/01/29 14:48:15
tag: ['Vanilla JS']
---
:ArticleToc
:ArticleHeader

最近看了一些关于 JavaScript 事件循环的文章，作为前端面试中几乎必问的一环，个人感觉还是有必要整理一篇文章来简单总结一下。

# 单线程且非阻塞

众所周知，JavaScript 是一门**单线程**的语言，即同一时间只能做一件事。为了防止主线程的阻塞，JavaScript 便有了同步和异步的概念，而异步的实现就是依赖于事件循环。

# 事件循环

在 JavaScript 中，任务的类型分为同步任务以及异步任务，同步任务会按照顺序，在执行栈中执行。遇到异步任务的时候，线程并不会等待异步任务的返回结果，而是将这个事件挂起，继续执行执行栈中的同步代码。当异步事件返回结果，将它（一般指回调函数）放到事件队列中，被放入事件队列不会立刻执行起回调，而是等待当前执行栈中所有同步任务都执行完毕，主线程处于空闲状态时会去查找事件队列中是否有任务，如果有，则取出排在第一位的事件，并把这个事件对应的回调放到执行栈中，然后执行其中的同步代码。

在 [Loupe](https://link.segmentfault.com/?enc=VLOKOpF5Q3a8qooAhlq7sw%3D%3D.%2FHVNnzF6ZmX2aX8OxaS66jjoIwzre2IeVI4xhR5Gz%2BY%3D) 上可以通过可视化来理解代码运行的顺序。

![preview](https://segmentfault.com/img/remote/1460000022805531/view)

# 宏任务与微任务

异步任务分类这两类，他们的区别在于事件循环机制中，执行的机制不同（顺序）。

当执行栈中的同步任务全部执行完成之后，会在事件队列中先取出所有的微任务执行，当所有的微任务执行完成之后，才会执行宏任务。所以可以看出来，微任务的优先级是要**高于**宏任务的。

常见的宏任务：

- script(整体代码)
- setTimeout()
- setInterval()
- postMessage
- I/O
- UI交互事件

常见的微任务:

- new Promise().then()
- MutationObserver

在事件循环中，每进行一次循环操作称为 tick，每一次 tick 的关键步骤如下：

- 执行一个宏任务（栈中没有就从事件队列中获取）
- 执行过程中如果遇到微任务，就将它添加到微任务的任务队列中
- 宏任务执行完毕后，立即执行当前微任务队列中的所有微任务（依次执行）
- 当前宏任务执行完毕，开始检查渲染，然后GUI线程接管渲染
- 渲染完毕后，JS线程继续接管，开始下一个宏任务（从事件队列中获取）

简单总结一下执行的顺序：
执行宏任务，然后执行该宏任务产生的微任务，**若微任务在执行过程中产生了新的微任务，则继续执行微任务**，微任务执行完毕后，再回到宏任务中进行下一轮循环。

# node环境中的事件循环

其实从 node11 的一个版本起，node 中宏任务微任务的执行已经和浏览器一致了，所以不再做过多的解释。

稍微不同的地方是： node 环境存在 `process.nextTick()`，它属于微任务，但它要先于`new Promise().then()`执行。在每一个 EventLoop 阶段完成后会去检查 nextTick 队列，如果里面有任务，会让这部分任务优先于微任务执行。是所有异步任务中最快执行的。

# 补充

- **实例化promise的过程其实是一个同步的代码，不要把它当作异步的任务**
- **await 只是 Promise 的语法糖。await 的代码即可以当作同步代码，await 后面的代码可以当作 Promise.then() 的回调函数。**

# 题目

## 第一题

```javascript
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    console.log('async2');
}
console.log('script start');
setTimeout(function() {
    console.log('setTimeout');
}, 0)
async1();
new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});
console.log('script end');
```

1. 从上往下执行代码，先执行同步代码，输出 `script start`
2. 遇到setTimeout，现把 setTimeout 的代码放到宏任务队列中
3. 执行 async1()，输出 `async1 start`, 然后执行 async2(), 输出 `async2`，把 async2() 后面的代码 `console.log('async1 end')`放到微任务队列中
4. 接着往下执行，输出 `promise1`，把 .then()放到微任务队列中；注意Promise本身是同步的立即执行函数，.then是异步执行函数
5. 接着往下执行， 输出 `script end`。同步代码（同时也是宏任务）执行完成，接下来开始执行刚才放到微任务中的代码
6. 依次执行微任务中的代码，依次输出 `async1 end`、 `promise2`, 微任务中的代码执行完成后，开始执行宏任务中的代码，输出 `setTimeout`

最后的执行结果如下

- script start
- async1 start
- async2
- promise1
- script end
- async1 end
- promise2
- setTimeout

## 第二题

```javascript
console.log('start');
setTimeout(() => {
    console.log('children2');
    Promise.resolve().then(() => {
        console.log('children3');
    })
}, 0);

new Promise(function(resolve, reject) {
    console.log('children4');
    setTimeout(function() {
        console.log('children5');
        resolve('children6')
    }, 0)
}).then((res) => {
    console.log('children7');
    setTimeout(() => {
        console.log(res);
    }, 0)
})
```

1. 从上往下执行代码，先执行同步代码，输出 `start`
2. 遇到setTimeout，先把 setTimeout 的代码放到宏任务队列①中
3. 接着往下执行，输出 `children4`, 遇到setTimeout，先把 setTimeout 的代码放到宏任务队列②中，此时.then并不会被放到微任务队列中，因为 resolve是放到 setTimeout中执行的
4. 代码执行完成之后，会查找微任务队列中的事件，发现并没有，于是开始执行宏任务①，即第一个 setTimeout， 输出 `children2`，此时，会把 `Promise.resolve().then`放到微任务队列中。
5. 宏任务①中的代码执行完成后，会查找微任务队列，于是输出 `children3`；然后开始执行宏任务②，即第二个 setTimeout，输出 `children5`，此时将.then放到微任务队列中。
6. 宏任务②中的代码执行完成后，会查找微任务队列，于是输出 `children7`，遇到 setTimeout，放到宏任务队列中。此时微任务执行完成，开始执行宏任务，输出 `children6`;

最后的执行结果如下

- start
- children4
- children2
- children3
- children5
- children7
- children6

## 第三题

```javascript
const p = function() {
    return new Promise((resolve, reject) => {
        const p1 = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(1)
            }, 0)
            resolve(2)
        })
        p1.then((res) => {
            console.log(res);
        })
        console.log(3);
        resolve(4);
    })
}


p().then((res) => {
    console.log(res);
})
console.log('end');
```

1. 执行代码，Promise本身是同步的立即执行函数，.then是异步执行函数。遇到setTimeout，先把其放入宏任务队列中，遇到`p1.then`会先放到微任务队列中，接着往下执行，输出 `3`
2. 遇到 `p().then` 会先放到微任务队列中，接着往下执行，输出 `end`
3. 同步代码块执行完成后，开始执行微任务队列中的任务，首先执行 `p1.then`，输出 `2`, 接着执行`p().then`, 输出 `4`
4. 微任务执行完成后，开始执行宏任务，setTimeout, `resolve(1)`，但是此时 `p1.then`已经执行完成，此时 `1`不会输出。

最后的执行结果如下

- 3
- end
- 2
- 4

## 第四题

```javascript
const p1 = new Promise((resolve, reject) => {
  console.log('promise1');
  resolve();
})
  .then(() => {
    console.log('then11');
    new Promise((resolve, reject) => {
      console.log('promise2');
      resolve();
    })
      .then(() => {
        console.log('then21');
      })
      .then(() => {
        console.log('then23');
      });
  })
  .then(() => {
    console.log('then12');
  });

const p2 = new Promise((resolve, reject) => {
  console.log('promise3');
  resolve();
}).then(() => {
  console.log('then31');
});
```

- 首先打印出 `promise1`
- 接着将 `then11`，`promise2` 添加到微任务队列，此时微任务队列为 `['then11', 'promise2']`
- 打印出 `promise3`，将 `then31` 添加到微任务队列，此时微任务队列为 `['then11', 'promise2', 'then31']`
- 依次打印出 `then11`，`promise2`，`then31`，此时微任务队列为空
- 将 `then21` 和 `then12` 添加到微任务队列，此时微任务队列为 `['then21', 'then12']`
- 依次打印出 `then21`，`then12`，此时微任务队列为空
- 将 `then23` 添加到微任务队列，此时微任务队列为 `['then23']`
- 打印出 `then23`