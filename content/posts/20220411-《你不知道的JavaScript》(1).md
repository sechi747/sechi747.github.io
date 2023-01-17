---
title: "读书笔记：《你不知道的 JavaScript》(1)"
description: ""
uid: 508
createTime: 2022/04/11 11:30:53
updateTime: 2022/04/11 11:30:53
tag: ['Vanilla JS']
---
:ArticleToc
:ArticleHeader

本篇文章总结自《你不知道的 JavaScript (上卷)》的第一章，是基于书籍内容和我个人的理解总结的，所以可能会有一些纰漏，请酌情阅读（虽然可能只有我自己才会读）。

# 作用域是什么

## 编译原理

JS 代码编译有三个步骤：

- 分词/词法分析（Tokenizing/Lexing）
  这个过程会将代码分解为多个词法单元（token）。比如 `var a = 1;` 就会被分解为：`var`、`a`、`=`、`1`、`;`。

- 解析/词法分析（Parsing）
  这个过程会将词法单元流（数组）转换为抽象语法树（Abstract Syntax Tree, AST）。比如 `var a = 1;` 会变成下面这样子：

  ```js
  {
    "type": "Program",
    "start": 0,
    "end": 11,
    "body": [
      {
        "type": "VariableDeclaration",
        "start": 0,
        "end": 10,
        "declarations": [
          {
            "type": "VariableDeclarator",
            "start": 4,
            "end": 9,
            "id": {
              "type": "Identifier",
              "start": 4,
              "end": 5,
              "name": "a"
            },
            "init": {
              "type": "Literal",
              "start": 8,
              "end": 9,
              "value": 1,
              "raw": "1"
            }
          }
        ],
        "kind": "var"
      }
    ],
    "sourceType": "module"
  }
  ```

- 代码生成
  这个过程会将 AST 转换为可执行代码。抛开具体细节，其实就是将 `var a = 1;` 的 AST 转化为一组机器指令（字节码 => 机器码），用来创建一个叫作 `a` 的变量（包括分配内容等），并将一个值存储在 `a` 中。

JS 代码的编译大部分时候都是发生在代码执行前。

## 作用域

首先介绍三个概念：

- 引擎
  负责整个 JavaScript 程序的编译及执行过程
- 编译器
  负责词法分析、语法分析及代码生成等工作
- 作用域
  负责收集并维护由所有声明的标识符（变量）组成的一系列查询，并且管理当前执行代码对这些标识符的访问权限

以 `var a = 1` 为例，编译器与作用域的交互如下：

1. 遇到 `var a` 时，编译器会询问作用域**是否已经有一个该名称的变量存在于同一个作用域的集合中**。如果是，那么编译器会忽略该变量的声明，然后继续编译；否则它会要求作用域在当前作用域的集合中声明一个新的变量，并命名为 `a`
2. 接下来编译器会为引擎生成运行时所需的代码，这些代码用来处理 `a = 2` 的赋值操作。引擎运行时会先询问作用域，当前的作用域集合中是否存在一个名为 `a` 的变量。如果存在，引擎会使用这个变量。如果不存在，引擎会继续查找变量
3. 如果引擎最终找到了 `a` 变量，则会将 `2` 赋值给它；如果没找到，则会抛出一个异常

### 引擎的两种查询方式

引擎在寻找变量时有两种查询方式：`LHS`(Left Hand Side) 和 `RHS`(Right Hand Side)

可以**笼统地**认为当变量出现在赋值操作的左侧时会进行 `LHS` 查询，出现在右侧时进行 `RHS` 查询。

例如 `console.log(a)` 对 `a` 的引用就是一个 `RHS` 引用，因为 `a` 并没有被赋予任何值。相应的，需要去查找并取得 `a` 的值，这样才能将值传递给 `console.log(...)`

例如 `a = 2` 对 `a` 的引用是一个 `LHS` 引用，因为我们并不关心当前 `a` 的值是什么，只想为 `= 2` 这个赋值操作找到一个目标

综上所述，可以将 `LHS` 理解为“赋值操作的目标是谁”，将 `RHS` 理解为“谁是操作赋值的源头”。也就是说 `LHS` 是**赋值操作**，`RHS` 是**寻值操作**

下面的代码既包含 `LHS` 也包含 `RHS`：

```js
function foo(a) {
  console.log(a)
}
foo(2)
```

首先 `foo(2)` 的函数调用需要对 foo 进行 `RHS` 引用，也就是去寻找 foo 的值。找 foo 的值后函数开始执行，当 `2` 被当作参数传递给 `foo(...)` 时，`2` 被赋值给了参数 `a`，因此需要进行 `LHS` 查询。这里还有对 `a` 进行的 `RHS` 引用，并将得到值传给了 `console.log(...)`。而 `console.log(...)` 本身也需要一个引用才能执行，因此会对 `console` 对象进行 `RHS` 查询，并检查得到的值是否有一个叫 `log` 的方法。最后，假设 `log(...)` 函数可以接收参数，则在将 `2` 赋值给其第一个参数前，这个参数需要进行一次 `LHS` 引用查询。

![image-20220411105712261](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220411105712261.png)

### 作用域嵌套

```js
function foo(a) {
  console.log(a + b)
}
var b = 2
foo(2) // 4
```

上述代码中，对 `b` 进行的 `RHS` 引用无法在函数 `foo` 内部完成，但可以在上一级作用域中完成。遍历嵌套作用域链的规则很简单：引擎会从当前的**执行作用域**开始查找变量，如果找不到，就去上一级继续查找。当抵达最外层的**全局作用域**时，无论找到还是没找到，查找过程都会停止。

### 异常

```js
function foo(a) {
  console.log(a + b)
  b = a
}
foo(2) // Uncaught ReferenceError: b is not defined
```

`console.log(a + b)` 时，对 b 进行 RHS 查询是无法找到该变量的，因为它未声明，引擎会抛出 `ReferenceError` 异常。

但如果执行的是 LHS 查询，且程序运行在“非严格模式”下，如果在全局作用域中也无法找到目标变量，则会在全局作用域下隐式地创建一个具有该名称的变量，并将其返回给引擎，比如下面的代码是可以正常运行的：

```js
function foo(a) {
  b = a
  console.log(a + b)
}
foo(2) // 4
```

但如果是“严格模式”下运行程序，则也会抛出 `ReferenceError` 异常：

```js
'use strict'
function foo(a) {
  b = a
  console.log(a + b)
}
foo(2) // Uncaught ReferenceError: b is not defined
```

如果 RHS 查询找到了一个变量，但你尝试对这个变量的值进行不合理的操作，比如试图对一个字符串的值进行函数调用，那么引擎会抛出 `TypeError` 异常。
