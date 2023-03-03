---
title: "关于Event.currentTarget的打印问题"
description: ""
uid: 524
createTime: 2023/03/03 16:58:50
updateTime: 2023/03/03 16:58:50
tag: ['Vanilla JS']
---
:ArticleToc
:ArticleHeader

今天遇到了一个问题：在事件处理函数中打印 `event` 对象，发现 `currentTarget` 的值是 `null`，但如果直接打印 `event.currentTarget` 就可以展示正确的值。猜测和 `console.log()` 的机制有关系，查了一些资料在此整理一下。

```js
const btn = document.getElementById('btn')
btn.onClick = function (event) {
  console.log(event.currentTarget === null) // false
  setTimeout((event) => {
    console.log(event.currentTarget === null) // true
  })
}
```

两次打印结果不同的原因是 `event.currentTarget` 只存在于**事件处理过程中**，而 `setTimeout` 中的代码执行时，click 的事件处理已经结束了，所以这时候再去读取 `event.currentTarget` 就会是 `null`

至于打印整个 `event` 对象时里面的 `currentTarget` 为 `null` 的原因则是 `console.log()` 的自身机制导致的。因为 `event` 是一个引用类型，当我们在控制台展开它的值时，浏览器会重新去内存里读一遍数据，此时事件处理已经结束了，所以也就不存在 `currentTarget` 了。而我们打印 `event.currentTarget` 时实际是打印了它的快照，所以可以展示出来正确的值。